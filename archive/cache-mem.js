const cacache = require('cacache/en');
const mem = require('mem');

const cacheDir = __dirname + '/cache';

const get = async (cb, args) => {
  let resp;
  const key = JSON.stringify(args);
  try {
    resp = await cacache.get(cacheDir, key);
  }
  catch(err) {
    resp = cb(args)
  }

  const data = JSON.parse(resp.data.toString());
  return data;
};

const put = async (args, value) => {
  cacache.put(cacheDir, key, value);
}

module.exports = {
  get,
  put,
};
