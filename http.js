const axios = require('axios');
const {cached} = require('./cache');

const TTL = 7*24*3600*1000; // 7 days

const withData = fn => async (...args) => {
  const resp = await fn(...args);
  return resp.data;
};
const getData = withData(axios.get);

const fetch = cached(axios.get, 'fetch');

const fetchData = withData(fetch);

const sanitize = (data) => JSON.parse(data.replace('\u0000', ''));

const getSanitized = (url, config = {}) => axios.get(url, {...config, transformResponse: sanitize});

module.exports = {
  ...axios,
  getData,
  getSanitized,
  fetch,
  fetchData,
};