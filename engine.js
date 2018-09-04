const http = require('axios');

const init = async () => {};

const config = {
  url: {
    npmjs: 'https://api.npmjs.org',
  }
};

const fetchDownloadData = async (packName, range) => {
  const url = `${config.url.npmjs}/downloads/range/${range}/${encodeURIComponent(packName)}`;
  const resp = await http.get(url);
  return resp.data;
};

const getData = async (packName) => {
  const downloadData = await fetchDownloadData(packName, '2017-08-28:2018-08-28');
  return downloadData;
};

module.exports = {
  init,
  getData,
};