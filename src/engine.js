const {fetch} = require('./http');

const init = async () => {};

const config = {
  url: {
    npmjs: 'https://api.npmjs.org',
    npms: 'https://api.npms.io',
  }
};

const fetchDownloadData = async (packName, range) => {
  const url = `${config.url.npmjs}/downloads/range/${range}/${encodeURIComponent(packName)}`;
  return fetch(url);
};
const fetchNpmsData = async (packName) => {
  const url = `${config.url.npms}/v2/package/${packName}`;
  return fetch(url);
};
const getDowloadsData = async (packName) => fetchDownloadData(packName, '2017-08-28:2018-08-28');

module.exports = {
  init,
  getNpmsData: fetchNpmsData,
  getDowloadsData,
};