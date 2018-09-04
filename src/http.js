const axios = require('axios');
const cache = require('./cache');


const getData = async (...args) => {
  const resp = await axios.get(...args);
  return resp.data;
};
const fetch = cache.mem(getData, 7*24*3600*1000, false);

module.exports = {
  ...axios,
  getData,
  fetch,
};