const sleep = (ms) => new Promise(
  (resolve, reject) => setTimeout(resolve, ms)
);
const getTimestamp = (date = new Date()) => {
  const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19)
    .replace('T', '_').replace(':', '-');
};
const getTimestampDigits =  (date = new Date()) => {
  const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19)
    .replace(/\D/g, '');
};
const throttleSleeper = (maxDuration, start = Date.now()) => {
  let tick, previousTick = start;
  return async () => {
    tick = Date.now();
    const duration = tick - previousTick;
    previousTick = tick;
    const throttleDelay =  maxDuration - duration;
    if( throttleDelay > 0 ) {
      await sleep(throttleDelay);
    }
    return tick;
  }
};
module.exports = {
  getTimestamp,
  getTimestampDigits,
  throttleSleeper,
  sleep,
};