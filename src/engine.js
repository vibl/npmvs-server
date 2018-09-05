const {fetchDownloadsData, fetchNpmsData} = require('./data-fetching');
const cache = require('./cache');
const {curryN} = require('ramda');

const init = async () => {};

const agreggateDownloadsData = curryN(2, (period, data) => {
  const res = [];
  let count = 0, acc = 0;
  for( let obj of data ) {
    count++;
    acc += obj.downloads;
    if( count === period ) {
      res.push(acc);
      acc = 0;
      count = 0;
    }
  }
  return res;
});

const agreggateDownloadsDataCached = cache.mem(agreggateDownloadsData);

const getDowloadsData = async (packName) => {
  const data = await fetchDownloadsData(packName, '2017-08-28:2018-08-28');
  return agreggateDownloadsDataCached(7, data.downloads);
};

module.exports = {
  agreggateDownloadsData,
  agreggateDownloadsDataCached,
  getNpmsData: fetchNpmsData,
  getDowloadsData,
  init,
};