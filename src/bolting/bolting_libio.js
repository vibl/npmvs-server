const {q, insert} = require('../db');
const http = require('../http');
const sql = require('./bolting_sql');
const {getTimestamp, sleep} = require('../util/vibl-util');

const batchSize = 59;

const apiKey = "653f8ad38c7c9c60ac58a88f8e9a0876";
const endpointUrl = 'https://libraries.io/api/npm/';
const queryStr = `?api_key=${apiKey}`;
const source = 1;
let downloadCount = 0;
const timerStart = Date.now();

const getResponseStats = ({outreq}) => {
  const respTime = (outreq.received - outreq.sent) / 1000;
  const elapsed = (Date.now() - timerStart) / 1000;
  const speed = Math.round(downloadCount / elapsed * 3600);
  return `${outreq.received}, ${elapsed} sec, ${respTime} sec, ${speed} items/h`;
};
const getData = async (pack) => {
  const url = endpointUrl + pack.name + queryStr;
  let [outreq] = await insert({url}, 'outreq');
  const resp = await http.get(outreq.url);
  const {data} = resp;
  downloadCount++;
  [outreq] = await q({id: outreq.id},
    `UPDATE outreq SET received = now() WHERE id = $(id) RETURNING *`);
  if( resp.status === 200 ) {
    console.log(getResponseStats({outreq}));
  } else {
    console.log(`${outreq.sent}, STATUS: ${resp.status}`)
  }
  await q({package:pack.id, source, outreq:outreq.id, data}, sql.package_input_Upsert);
};
const main = async () => {
  while(true) {
    const batchTimer = Date.now();
    const batchList = await q({source, batchSize}, sql.package_BatchList);
    if( batchList.length === 0 ) break;
    try {
      await Promise.all(batchList.map(getData));
    }
    catch (err) {
      console.log(err);
    }
    const batchDuration = Date.now() - batchTimer;
    const throttleDelay = 60 * 1000 - batchDuration;
    if( throttleDelay > 0 ) {
      console.log(`${getTimestamp()}: THROTTLE: sleeping for ${throttleDelay} in order to obey API rate limit`);
      await sleep(throttleDelay)
    }
  }
};
main().then(console.log).catch(console.error);




