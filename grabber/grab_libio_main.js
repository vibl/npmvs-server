const {q, insert} = require('../db');
const http = require('../http');
const sql = require('./sql_tpl');
const config = require('../config');
const {getTimestamp, sleep, throttleSleeper} = require('../util/vibl-util');

const batchSize = 60;
// Don't use viblApiToken because I don't want to be identified, let alone blacklisted,
// with my real GitHub account.
// const viblApiToken = "653f8ad38c7c9c60ac58a88f8e9a0876";
const endpointUrl = 'https://libraries.io/api/npm/';
const source = 1;
const rateLimit = 1; // Requests per second. It is inferior to the one stated by Libraries.io. They may have got the logic wrong on the backend...

const batchRateLimit = rateLimit / batchSize;
const minBatchDuration = 1000 / batchRateLimit; // In ms.

let downloadCount = 0;

const getAccountConfig = (apiToken, i) => {
  const accountOffsetDelay =  i * 6000;
  const throttleSleep = throttleSleeper(minBatchDuration, Date.now() + accountOffsetDelay);
  return {
    accountOffsetDelay,
    apiToken,
    throttleSleep,
  };
};
const logResponse = (outreq) => q(outreq,
  `UPDATE outreq SET received = now(), error = $(error) WHERE id = $(id) RETURNING *`);

const getData = (apiToken) => async (pack) => {
  let [outreq] = await insert({received: null}, 'outreq');
  const url = endpointUrl + encodeURIComponent(pack.name) + '?api_key=' + apiToken;

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
const downloadWithAccount = async ({accountOffsetDelay, apiToken, throttleSleep}) => {
  while(true) {
    await sleep(accountOffsetDelay);
    const batch = await q({source, batchSize}, sql.package_BatchList);
    if( batch.length === 0 ) break;
    await Promise.all(batch.map(getData(apiToken)));
    await throttleSleep();
  }
};
const main = async () => {
  console.log('Downloading Libraries.io packages data...');
  const accounts = config.apiTokens.libio.map(getAccountConfig);
  try {
    await Promise.all(accounts.map(downloadWithAccount));
  }
  catch (err) {
    console.log(err);
  }
};
module.exports = main;




