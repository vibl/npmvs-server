const {q, insert} = require('../db');
const http = require('../http');
const sql = require('./sql_tpl');
const {getTimestamp, throttleSleeper} = require('../util/vibl-util');

const batchSize = 1000;
const endpointUrl = `https://api.npms.io/v2/package/`;
const source = 2;
const rateLimit = 10; // Requests per second.
const minRequestDuration = 1000 / rateLimit; // In ms.
const throttleSleep = throttleSleeper(minRequestDuration);

let tick = Date.now();
let downloadCount = 0;

const logResponse = (outreq) => q(outreq,
    `UPDATE outreq SET received = now(), error = $(error) WHERE id = $(id) RETURNING *`);

const getData = async (pack) => {
  let [outreq] = await insert({received: null}, 'outreq');
  const url = endpointUrl + encodeURIComponent(pack.name.toLowerCase());
  try {
    const {data} = await http.getSanitized(url);
    downloadCount++;
    [outreq] = await logResponse(outreq);
    await q({package:pack.id, source, outreq:outreq.id, data}, sql.package_input_Upsert);
  }
  catch(error) {
    if( error.response ) {
      status = error.response.status;
      await logResponse({...outreq, status});
      if( [400, 404, 500].includes(status) ) {
        // Insert a row with an empty `data` field. DO NOT update existing rows!
        await q({package:pack.id, source, outreq:outreq.id, data: null},
          `INSERT INTO package_input as p ($(this~)) VALUES ($(this:csv)) ON CONFLICT DO NOTHING`);
      } else {
        console.log(`${getTimestamp()}: npms : ERROR ${status} (${url})`);
      }
    } else {
      console.log(`${getTimestamp()}: npms : ERROR ${error} (${url})`);
    }
  }
};
const getBatchData = async (batch) => {
  for(let pack of batch) {
    await getData(pack);
    await throttleSleep();
  }
};
const main = async () => {
  console.log('Grabbing data from NPMS...');
  while(true) {
    const batch = await q({source, batchSize}, sql.package_BatchList);
    if( batch.length === 0 ) break;
    try {
      await getBatchData(batch);
    }
    catch (err) {
      console.log(err);
    }
  }
};
module.exports = main;
