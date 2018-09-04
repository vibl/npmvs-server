const catbox = require('catbox');
const catboxDisk = require('catbox-disk');
const { memoizer } = require('memcache-client-memoizer');

const TTL = 7 * 24 * 3600 * 1000 ; // 7 Days

const cache = new catbox.Client(catboxDisk, {
  partition: 'test',
  cleanEvery: TTL*2,
  cachePath: __dirname + '/../cache',
});
const init = async () => cache.start();

const mem = (fn) => memoizer({
  client: cache,
  fn,
  keyFn: (...args) => ({segment: '_', id: JSON.stringify(args)}),
  setOptions: TTL,
  cacheResultTransformFn: ({ item }) => item,
});
const get = (url) => {
  cache ||
};

module.exports = {
  init,
  get,
  set,
  mem,
};
