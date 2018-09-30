const {fetchData} = require('../http');

const config = {
  url: {
    npmjs: 'https://api.npmjs.org',
    npms: 'https://api.npms.io',
  }
};
// `encodeURIComponent` is needed here because `packageName` was decoded by Koa.
const fetchDownloadsData = async (packName, range) => {
  const url = `${config.url.npmjs}/downloads/range/${range}/${encodeURIComponent(packName)}`;
  return fetchData(url);
};
const fetchNpmsData = async (packName) => {
  const url = `${config.url.npms}/v2/package/${encodeURIComponent(packName)}`;
  return fetchData(url);
};

module.exports = {
  config,
  fetchNpmsData,
  fetchDownloadsData,
};