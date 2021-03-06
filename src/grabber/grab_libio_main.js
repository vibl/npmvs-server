const {q} = require('../db');
const sql = require('./sql_tpl');
const secrets = require('../secrets');
const getData = require('./getPackageDataFromSource');
const {sleep, throttleSleeper} = require('../util/vibl-util');

const batchSize = 60;
// Don't use viblApiToken because I don't want to be identified, let alone blacklisted,
// with my real GitHub account.
// const viblApiToken = "653f8ad38c7c9c60ac58a88f8e9a0876";
const endpointUrl = 'https://libraries.io/api/npm/';
const rateLimit = 1; // Requests per second. It is inferior to the one stated by Libraries.io. They may have got the logic wrong on the backend...

const batchRateLimit = rateLimit / batchSize;
const minBatchDuration = 1000 / batchRateLimit; // In ms.

const urlBuilder = (apiToken) => (packName) =>
  endpointUrl + encodeURIComponent(packName.toLowerCase()) + '?api_key=' + apiToken;

const source = {
  id: 1,
  name: 'libio_main',
  getUrl: urlBuilder(secrets.apiTokens.libio[0]), // Use the first token by default (any would do).
};
const getAccountConfig = (apiToken, i) => {
  const accountOffsetDelay =  i * 6000;
  const throttleSleep = throttleSleeper(minBatchDuration, Date.now() + accountOffsetDelay);
  return {
    accountOffsetDelay,
    apiToken,
    throttleSleep,
  };
};
const downloadWithAccount = async ({accountOffsetDelay, apiToken, throttleSleep}) => {
  source.getUrl = urlBuilder(apiToken); // Overriding default getUrl function.
  while(true) {
    await sleep(accountOffsetDelay);
    const batch = await q({source_id: source.id, batchSize}, sql.package_BatchList);
    if( batch.length === 0 ) break;
    await Promise.all(batch.map( packName => getData(source, packName)));
    await throttleSleep();
  }
};
const getMissingPackages = async () => {
  console.log('Grabbing data from Libraries.io...');
  const accounts = secrets.apiTokens.libio.map(getAccountConfig);
  try {
    await Promise.all(accounts.map(downloadWithAccount));
  }
  catch (err) {
    console.log(err);
  }
};
module.exports = {
  source,
  getMissingPackages,
};




