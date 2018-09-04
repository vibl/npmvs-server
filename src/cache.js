const catbox = require('catbox');
const catboxDisk = require('catbox-disk');
const { memoizer } = require('memcache-client-memoizer');

const cache = new catbox.Client(catboxDisk, {
  partition: 'test',
  cleanEvery: 3 * 3600 * 1000, // 3 hours
  cachePath: __dirname + '/../cache',
});

let started = false;

const mem = (fn, TTL, stringify = true) => {
  if( ! started ) {
    cache.start();
    started = true;
  }
  const keyFn =  (...args) => ({
    segment: '_',
    id: stringify ? JSON.stringify(args) : args[0]
  });
  return memoizer({
    client: cache,
    fn,
    keyFn,
    setOptions: TTL,
    cacheResultTransformFn: ({ item }) => item,
  });
}

const {get, set} = cache;

module.exports = {
  get,
  set,
  mem,
};
