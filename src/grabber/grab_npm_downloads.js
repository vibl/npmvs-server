const addMonths = require('date-fns/add_months');
const format= require('date-fns/format');
const pMap = require('p-map');
const {q, q1, insert1} = require('../db');
const sql = require('./sql_tpl');
const http = require('../http');
const {flatten} = require('lodash');
const {getTimestamp, throttleSleeper} = require('../util/vibl-util');


const endpointUrl = `https://api.npmjs.org/downloads/range/`;
const batchSize = 1000;
const concurrency = 5;
// const rateLimit = 10; // Requests per second.
// const minRequestDuration = 1000 / rateLimit; // In ms.
// const throttleSleep = throttleSleeper(minRequestDuration);


const source = {
  id: 3,
  name: 'npm_downloads',
};

const logResponse = (outreq) => q1(outreq, sql.outreq_update_received_now);
const firstAvailableDate = new Date('2015-01-10');

const getRanges = () => {
  let acc = [], startDate = firstAvailableDate, endDate, range;
  while(true) {
    endDate = addMonths(startDate, 18);
    range = [startDate, endDate].map(date => format(date, 'YYYY-MM-DD')).join(':');
    acc.push(range);
    startDate = endDate;
    if( startDate > new Date() ) break;
  }
  return acc;
};
const ranges = getRanges();
// Postgres does not support the null byte character in JSON (https://docs.postgresql.fr/9.4/release-9-4-1.html),
// so we need to remove it but also it representation "\\u0000", which would be converted
// in the null byte by JSON.parse.
// The second part of the | alternative `([^\\])\\u0000` has a sort of 'look-behind' (which does not
// exist natively in js). This look-behind excludes a double set of slashes (\\) because that's an escape
// of an escape character, which means the string '\u0000' is meant literally in the text (probably in some
// code example).
const getUrl = (packName, range) => endpointUrl + range + '/' + encodeURIComponent(packName.toLowerCase());

const getData = async (source, pack) => {
  let outreq = await insert1({received: null}, 'outreq');
  const urls = ranges.map(range => getUrl(pack.name, range));
  try {
    const data = await Promise.all(urls.map(http.getData));
    const downloads = flatten(data.map(o => o.downloads.map(o => [o.day, o.downloads])));
    outreq = await logResponse(outreq);
    // I could not find a way to insert an array in a jsonb column, so we must wrap it in an object here.
    await q({package_id:pack.id, source_id: source.id, outreq_id:outreq.id, data: {downloads}},
      sql.package_input_Upsert);
  }
  catch(err) {
    let error;
    if( err.response ) {
      status = err.response.status;
      await logResponse({...outreq, status});
      if( [400, 404, 500].includes(status) ) {
        // Insert a row with an empty `data` field. DO NOT update existing rows!
        await q({package_id:pack.id, source_id: source.id, outreq_id:outreq.id, data: null},
          `INSERT INTO package_input as p ($(this~)) VALUES ($(this:csv)) ON CONFLICT DO NOTHING`);
      } else {
        error = status;
      }
    } else {
      error = err;
    }
    console.log(`${getTimestamp()}: ${source.name} : ERROR ${error} (${urls[0]})`);

  }
};
const getDataTask = (pack) => getData(source, pack);

const getMissingPackages = async () => {
  console.log('Grabbing data from NPM Downloads...');
  while(true) {
    const batch = await q({source_id: source.id, batchSize}, sql.package_BatchList);
    if( batch.length === 0 ) break;
    try {
      await pMap(batch, getDataTask, {concurrency});
    }
    catch (err) {
      console.log(err);
    }
  }
};
module.exports = {
  source,
  getMissingPackages,
};
