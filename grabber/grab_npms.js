const {q} = require('../db');
const sql = require('./sql_tpl');
const getData = require('./getPackageDataFromSource');

const {throttleSleeper} = require('../util/vibl-util');

const batchSize = 1000;
const endpointUrl = `https://api.npms.io/v2/package/`;
const rateLimit = 10; // Requests per second.
const minRequestDuration = 1000 / rateLimit; // In ms.
const throttleSleep = throttleSleeper(minRequestDuration);

const source = {
  id: 2,
  getUrl: (packName) => endpointUrl + encodeURIComponent(packName.toLowerCase()),
};

const getBatchData = async (batch) => {
  for(let pack of batch) {
    await getData(source, pack);
    await throttleSleep();
  }
};
const main = async () => {
  console.log('Grabbing data from NPMS...');
  while(true) {
    const batch = await q({source: source.id, batchSize}, sql.package_BatchList);
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
