const axios = require('axios');
const {cached} = require('../server/src/cache');

const TTL = 7*24*3600*1000; // 7 days

const withData = fn => async (...args) => {
  const resp = await fn(...args);
  return resp.data;
};
const getData = withData(axios.get);

const fetch = cached(axios.get, 'fetch');

const fetchData = withData(fetch);

module.exports = {
  ...axios,
  getData,
  fetch,
  fetchData,
};