const {q, insert, pgp} = require('../src/db');
const http = require('../http');
const sql = require('./sql_tpl');
const {keys} = require('ramda');
const {getTimestamp, sleep} = require('../util/vibl-util');
const {indexValWithKey} = require('../util/vibl-fp');

const batchSize = 1;
const url = `https://api.npms.io/v2/package/mget`;
const source = 2;

let downloadCount = 0;
const timerStart = Date.now();

const getPackagesRows = ({data, source, packIdsIndex, outreq}) => {
  const rows = [];
  for(let packName in data) {
    const packData = data[packName];
    const columns = {
      package: packIdsIndex[packName],
      source,
      outreq: outreq.id,
      data: packData,
    };
    rows.push(columns);
  }
  return rows;
};
const logResponse = (outreq) => q(outreq,
  `UPDATE outreq SET received = now(), error = $(error) WHERE id = $(id) RETURNING *`);

const getResponseStats = ({outreq}) => {
  const respTime = (outreq.received - outreq.sent) / 1000;
  const elapsed = (Date.now() - timerStart) / 1000;
  const speed = Math.round(downloadCount / elapsed * 3600);
  return `${getTimestamp(outreq.received)}, ${downloadCount}, ${elapsed} sec, ${respTime} sec, ${speed} items/h`;
};
const getData = async (batch) => {
  let [outreq] = await insert({received: null}, 'outreq'); // Inserting nothing, just to set the `sent` timestamp.
  const packIdsIndex = indexValWithKey('name', 'id', batch);
  const body = keys(packIdsIndex);
  try {
    const {data} = await http.post(url, body);
    downloadCount += data.length;
    [outreq] = await logResponse(outreq);
    const packagesRows = getPackagesRows({data, source, packIdsIndex, outreq});
    await q(pgp.helpers.insert(packagesRows, keys(packagesRows[0]), "package_input") +
      `ON CONFLICT (package, source) DO UPDATE SET outreq = EXCLUDED.outreq, data = EXCLUDED.data;`);
  }
  catch(resp) {
    const error = resp.response.status;
    await logResponse({...outreq, error});
    if( error === 404 ) {
      // Insert a row with an empty `data` field. DO NOT update existing rows!
      await q({package:pack.id, source, outreq:outreq.id, data: null},
        `INSERT INTO package_input as p ($(this~)) VALUES ($(this:csv)) ON CONFLICT DO NOTHING`);
    } else {
      console.log(`${getTimestamp()}: npms : ERROR ${error}`);
    }

  }
};
const main = async () => {
  console.log('Grabbing data from NPMS multiple...');
  while(true) {
    const batch = await q({source, batchSize}, sql.package_BatchList);
    if( batch.length === 0 ) break;
    try {
      await getData(batch);
    }
    catch (err) {
      console.log(err);
    }
    const throttleDelay = 2 * 1000;
    await sleep(throttleDelay)
  }
};
module.exports = main;




