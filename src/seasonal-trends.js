const fs = require('fs');
const mem = require('mem');
const {add, map, mean, pipe, prop, transpose, reduce, values} = require('ramda');
const {config} = require('./data-fetching');
const cache = require('./cache');
const {fetchData} = require('./http');
const {agreggateDownloadsData, agreggateDownloadsDataCached} = require('./engine');

const sum = reduce(add, 0);

const getTopPackages = () => {
  const file = __dirname + '/top-packages.txt';
  const str = fs.readFileSync(file, {encoding: 'utf8'});
  const topPackages = str.split('\n');
  return topPackages;
};
// const agreggateDownloadsDataMem = mem(agreggateDownloadsData);
const fluctuations = (list) => {
  const average = mean(list);
  return map( n => n/average, list);
};
const getTrends = async (range) => {
  await cache.init();
  const topPackages = getTopPackages();
  const topPackagesStr = topPackages.join(',');
  const url = `${config.url.npmjs}/downloads/range/${range}/${topPackagesStr}`;
  const data = await fetchData(url);
  const result = pipe(
    values,
    map(prop('downloads')),
    map(agreggateDownloadsData(7)),
    transpose,
    x => {
      return x;
    },
    map(sum),
    fluctuations,
    )(data);
   return result;
};
const getTrendsMem = mem(getTrends);

if(require.main === module) {
  getTrends().then(console.log).catch(console.log);
} else {
  module.exports = {
    getTrendsMem,
  }
}
