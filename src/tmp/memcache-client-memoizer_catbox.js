const { memoizer } = require('memcache-client-memoizer');
const catboxDisk = require('catbox-disk');
const Catbox = require('catbox');

const cacheTtlMilliseconds = 1000 * 60 * 5; // 5 min
const cachePath = __dirname + '/cache';
const cache = new Catbox.Client(catboxDisk, {
  partition: 'test',
  cleanEvery: 3 * 3600 * 1000, // 3 hours
  cachePath,
});

const fnToMemoize = (n) => n + Math.random();


const main = async () => {
  await cache.start();
  const memoizedFn = memoizer({
    client: cache,
    fn: fnToMemoize,
    keyFn: (n) => ({ segment: 'test', id: n.toString() }), // this can return anything
    setOptions: cacheTtlMilliseconds,
    cacheResultTransformFn: ({ item }) => item,
  });

  const resp1 = await memoizedFn(1);
  const resp2 = await memoizedFn(1);
  const resp3 = await memoizedFn(3);

  return {resp1, resp2, resp3};
};


main().then(console.log).catch(console.error);