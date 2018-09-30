const {q, insert, pgp} = require('../db');
const http = require('../http');
const sql = require('./sql_tpl');
const {getTimestamp, sleep} = require('../util/vibl-util');

const batchSize = 1000;
const throttleDelay = 0;
const endpointUrl = `https://api.npms.io/v2/package`;
const source = 2;

let downloadCount = 0;

const logResponse = (outreq) => q(outreq,
    `UPDATE outreq SET received = now(), error = $(error) WHERE id = $(id) RETURNING *`);

const getData = async (pack) => {
  let [outreq] = await insert({received: null}, 'outreq');
  const url = endpointUrl + encodeURIComponent(pack.name);
  try {
    const {data} = await http.get(url);
    downloadCount++;
    [outreq] = await logResponse(outreq);
    await q({package:pack.id, source, outreq:outreq.id, data}, sql.package_input_Upsert);
  }
  catch(resp) {
    const error = resp.response.status;
    await logResponse({...outreq, error});
    if( error === 404 ) {
      // Insert a row with an empty `data` field. DO NOT update existing rows!
      await q({package:pack.id, source, outreq:outreq.id, data: null},
        `INSERT INTO package_input as p ($(this~)) VALUES ($(this:csv)) ON CONFLICT DO NOTHING`);
    } else {
      console.log(`${getTimestamp()}: libio : ERROR ${error}`);
    }
  }
};
const getBatchData = async (batch) => {
  for(let pack of batch) {
    await getData(pack);
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
    await sleep(throttleDelay)
  }
};
module.exports = main;
