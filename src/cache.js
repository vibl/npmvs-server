const cacache = require('cacache');
const {map, pick} = require('ramda');

const rootPath = '/home/vianney/dev/idea/npmvs/server/src/data/.cache/';

const fnWithPath = (path) => (fn) => (...args) => fn(path, ...args);

const nsCache = (namespace) => ({
  ...cacache,
  ...map(fnWithPath(rootPath + namespace), pick(['get', 'put', 'ls', 'verify'], cacache)),
});

const cached = (fn, namespace, cacheArgs) => {
  const mem = new Map();
  const cache = nsCache(namespace);
  return async (...fnArgs) => {
    const key = JSON.stringify(fnArgs);
    if( mem.has(key) ) return mem.get(key);
    try {
      let got = await cache.get(key);
      return got;
    } catch { }
    const result = await fn(...fnArgs);
    mem.set(key, result);
    const str = JSON.stringify(result);
    cache.put(key, str);
    return result;
  }
};

module.exports = {
  ...cacache,
  ...nsCache('default'),
  cached,
};

