const catbox = require('catbox');
const catboxDisk = require('catbox-disk');
const { memoizer } = require('memcache-client-memoizer');

const defaultTTL = 7 * 24 * 3600 * 1000 ; // 7 days

const cachePath = __dirname + '/../cache';

const catboxCacheWithMemoizer = new catbox.Client(catboxDisk, {
  partition: 'test',
  cleanEvery: 3 * 3600 * 1000, // 3 hours
  cachePath,
});

let started = false;

const init = async () => cache.start();

const mem = (fn, TTL = defaultTTL, stringify = true) => {
  if( ! started ) {
    init();
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
  init,
  get,
  set,
  mem,
};
