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

module.exports = {
  sleep,
  getTimestamp,
  getTimestampDigits,
};