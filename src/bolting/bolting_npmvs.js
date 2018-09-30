const {q, insert, pgp} = require('../db');
const http = require('../http');
const sql = require('./bolting_sql');
const config = require('../config');
const {keys} = require('ramda');
const {getTimestamp, sleep} = require('../util/vibl-util');

const batchSize = 60;
const url = `https://api.npms.io/v2/package/mget`;
const source = 2;

let downloadCount = 0;
const timerStart = Date.now();

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
  try {
    const {data} = await http.post(url, batch);
    downloadCount += data.length;
    [outreq] = await logResponse(outreq);
    const packagesData = data.map( (packData) => ({package:packData.id, source, outreq:outreq.id, data}) );
    await q(packagesData, pgp.helpers.insert(data, keys(packagesData[0]), "package_input") +
      `ON CONFLICT (package, source) DO UPDATE SET outreq = EXCLUDED.outreq, data = EXCLUDED.data);`);
  }
  catch(resp) {
    const error = resp.response.status;
    await logResponse({...outreq, error});
    if( error === 404 ) {
      // Insert a row with an empty `data` field. DO NOT update existing rows!
      await q({package:pack.id, source, outreq:outreq.id, data: {}},
        `INSERT INTO package_input as p ($(this~)) VALUES ($(this:csv)) ON CONFLICT DO NOTHING`);
    } else {
      console.log(`${getTimestamp()}: ERROR ${error}`);
    }

  }
};
const main = async () => {
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
main().then(console.log).catch(console.error);





