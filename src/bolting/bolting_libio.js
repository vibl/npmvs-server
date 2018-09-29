const {q, insert} = require('../db');
const http = require('../http');
const sql = require('./bolting_sql');
const config = require('../config');
const {getTimestamp, sleep} = require('../util/vibl-util');

const batchSize = 58;
// Don't use viblApiToken because I don't want to be identified, let alone blacklisted,
// with my real GitHub account.
const viblApiToken = "653f8ad38c7c9c60ac58a88f8e9a0876";
const endpointUrl = 'https://libraries.io/api/npm/';
const source = 1;
let downloadCount = 0;
const timerStart = Date.now();

const logResponse = (outreq) => q(outreq,
  `UPDATE outreq SET received = now(), error = $(error) WHERE id = $(id) RETURNING *`);

const urlBuilder = ({endpointUrl, apiToken}) => {
  const queryStr = `?api_key=${apiToken}`;
  return (packName) =>  endpointUrl + packName + queryStr;
};
const getResponseStats = ({outreq}) => {
  const respTime = (outreq.received - outreq.sent) / 1000;
  const elapsed = (Date.now() - timerStart) / 1000;
  const speed = Math.round(downloadCount / elapsed * 3600);
  return `${getTimestamp(outreq.received)}, ${downloadCount}, ${elapsed} sec, ${respTime} sec, ${speed} items/h`;
};
const getData = (getUrl) => async (pack) => {
  const url = getUrl(pack.name);
  let [outreq] = await insert({url}, 'outreq');
  let data;
  try {
    const resp = await http.get(outreq.url);
    data = resp.data;
    downloadCount++;
    [outreq] = await logResponse(outreq);
    await q({package:pack.id, source, outreq:outreq.id, data}, sql.package_input_Upsert);
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
const downloadWithAccount = async ({accountOffsetDelay, apiToken}) => {
  while(true) {
    await sleep(accountOffsetDelay * 1000);
    const batchTimer = Date.now();
    const batchList = await q({source, batchSize}, sql.package_BatchList);
    if( batchList.length === 0 ) break;
    const getUrl = urlBuilder({endpointUrl, apiToken});
    await Promise.all(batchList.map(getData(getUrl)));
    const batchDuration = Date.now() - batchTimer;
    const throttleDelay = 60 * 1000 - batchDuration;
    if( throttleDelay > 0 ) {
      // console.log(`${getTimestamp()}: THROTTLE: sleeping for ${Math.round(throttleDelay / 1000)} seconds in order to obey API rate limit`);
      await sleep(throttleDelay)
    }
  }
};
const main = async () => {
  const accounts = config.apiTokens.libio.map( (apiToken, i) => ({accountOffsetDelay: i * 3, apiToken}));
  try {
    await Promise.all(accounts.map(downloadWithAccount));
  }
  catch (err) {
    console.log(err);
  }
};
main().then(console.log).catch(console.error);




