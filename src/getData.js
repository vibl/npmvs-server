const fs = require('fs');
require('./configure');
const cache = require('./cache');
const {fetchData} = require('../../collector/http');
const github = require('./github');

const packId = 'victory';
const token = '389dfd76a9f1d65d99cf38f8f7d12ed0e97f3066';

const npmRegistryUrl = 'https://registry.npmjs.com/';

const timestamp = (new Date()).toJSON();
const file = `${__dirname}/data/github/${packId}_${timestamp}.json`;

const main = async () => {
  await cache.init();
  console.time('NPM request');
  const packData = await fetchData(npmRegistryUrl + packId);
  console.timeEnd('NPM request');
  // const repository = packData.repository.url.match(/(http.+)\.git$/)[1];
  console.time('API requests');
  const data = await github({name: packId, repository: packData.repository}, {tokens: [token]});
  console.timeEnd('API requests');
  fs.writeFileSync(file, JSON.stringify(data));
  console.log(data);
};

main().then(console.log).catch(console.error);
