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

// Postgres does not support the null byte character in JSON (https://docs.postgresql.fr/9.4/release-9-4-1.html),
// so we need to remove it but also it representation "\\u0000", which would be converted
// in the null byte by JSON.parse.
const sanitize = (data) => {
  return JSON.parse(data.replace(/(\0|\\u0000)/g, ''));
}

const getSanitized = (url, config = {}) => axios.get(url, {...config, transformResponse: sanitize});

module.exports = {
  ...axios,
  getData,
  getSanitized,
  fetch,
  fetchData,
};