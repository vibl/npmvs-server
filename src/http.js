const axios = require('axios');
const cache = require('./cache');

const TTL = 7*24*3600*1000; // 7 days

const getData = async (...args) => {
  const resp = await axios.get(...args);
  return resp.data;
};
const fetch = cache.mem(axios.get, TTL, false);

const fetchData = cache.mem(getData, TTL, false);

module.exports = {
  ...axios,
  getData,
  fetch,
  fetchData,
};