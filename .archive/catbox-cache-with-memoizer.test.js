const cache = require('./cache');
const sleep = (delay) =>
  new Promise( (resolve, reject) => setTimeout( () => resolve(), delay) );

const slow = async (val) => {
  await sleep(2000);
  return val;
};

async function main() {
  const n = 2;
  await cache.init();
  const fast = cache.mem(slow);
  const res1 = await fast(n);
  console.log(res1);
  await sleep(100);
  const res2 = await fast(n);
  console.log(res2);
}
main().then(console.log).catch(console.log);