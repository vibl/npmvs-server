const {omit, values} = require('ramda');

const periodsDaysAgo = [
  90,
  180,
  365,
  730,
  Infinity
];
const extractReleasesCount = ({value :releases}) => {
  const now = Date.now();
  let releasesDaysAgo = values(omit(['modified', 'created'], releases)).map( date => (now - new Date(date)) / 1000 / 3600 / 24 );
  releasesDaysAgo.sort((a, b) => a - b);
  let
    acc = [0],
    period = 0;

  for(let releaseDaysAgo of releasesDaysAgo) {
     if( releaseDaysAgo > periodsDaysAgo[period] ) {
       period++;
       acc[period] = acc[period - 1];
     }
     acc[period]++;
   }
   return acc;
};
const downloadsMonthlyAggregate = (data) => {
  if (!data) return null;
  const result = [];
  const getMonth = slice(0, 7);
  const lastDay = last(data).day;
  let currentMonth,
    acc = 0,
    daysCount = 0,
    previous = getMonth(data[0].day);
  for (const [day, downloads] of data) {
    currentMonth = getMonth(day);
    if (currentMonth !== previous || day === lastDay) {
      result.push({month: previous, value: Math.round(acc / daysCount * 365 / 12)});
      acc = 0;
      daysCount = 0;
    }
    acc += downloads;
    daysCount++;
    previous = currentMonth;
  }
  return result;
};
module.exports = {
  downloadsMonthlyAggregate,
  extractReleasesCount,
};