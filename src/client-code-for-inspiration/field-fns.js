import size from "lodash/size";
import {mem} from '../util/utils';
import {dec, last, length, map, mean, multiply, pipe, reduce, slice, sum, toPairs, values} from 'ramda';
const {concatLeft, curry2, getDotPath, ident, percent, pipeD} = require('../util/vibl-fp');

const significantDigits = curry2(
  (digits, n) => {
    let x = Math.round(n) >= 10 ** digits
      ? Math.round(n).toString()
      : Number.parseFloat(n).toPrecision(digits)
    return x.replace(/\.0+$/, '');
  }
);
const percentGrowth = pipe(dec, multiply(100));

const thousands = n => significantDigits(2, n/1000) + 'k';

const growthSeries = (series) => {
  let i,
    growth,
    acc = [],
    n = series.length;
  for(i=1;i<n;i++) {
    growth = series[i-1] === 0 ? 1 : series[i]/series[i-1];
    acc.push(growth);
  }
  return acc;
};
const buildupSeries = (series) => {
  let i,
    growth,
    acc = [],
    n = series.length;
  for(i=1;i<n;i++) {
    growth = series[i-1] === 0 ? 1 : series[i] - series[i-1];
    acc.push(growth);
  }
  return acc;
};
const acceleration = pipeD(
  growthSeries,
  buildupSeries,
  mean,
);
const fns = {
  acceleration,
  explicitPlus: str => parseFloat(str) > 0 ? '+' + str : str,
  ident,
  none: () => undefined,
  count: val => size(val),
  downloads: getDotPath('5.count'), // (a) => a[5] && a[5].count,
  commits6months: getDotPath('3.count'), // (a) => a[4] && a[4].count,
  linters: getDotPath('js.0'), // (o) => o && o.js && o.js[0],
  shorten20chars: str => str.slice(0, 20),
  percent: n => Math.round(n * 100).toString() + "%",
  hoursFromSeconds: n => Math.round(n / 3600),
  thousands,
  significantDisplay: significantDigits(2),
      // Number of contributors who have contributed 80% of the commits.
  paretoContributors: list => {
    const first = list.shift().commitsCount;
    // Accumulate sums of commits.
    const sums = list.reduce( (acc, o) => [...acc, last(acc) + o.commitsCount], [first]);
    const total = last(sums);
    // Count contributors until 80% of commits are reached.
    return sums.reduce( (acc, val) => val/total <= 0.8 ? acc + 1 : acc, 0);
  },
  contributorsCount: length,
  averageOpenIssueDuration: dist => {
    const issuesCount = sum(values(dist));
    const averageReducer = (acc, pair) => acc + parseInt(pair[0]) * pair[1];
    const total = pipe(
      toPairs,
      reduce(averageReducer, 0)
    )(dist);
    const averageSeconds = total / issuesCount;
    const averageDays = Math.round(averageSeconds / 3600 / 24 * 10) / 10;
    return averageDays;
  },
  percentGrowth,
  significanPercentDisplay: pipe(significantDigits(2), concatLeft('%')),
  percent1dec: percent(1),
  percent2dec: percent(2),
  monthlyAggregate: mem( (data, packName) => {
    if( ! data ) return null;
    const result = [];
    const getMonth = slice(0, 7);
    const lastDay = last(data).day;
    let currentMonth,
      acc = 0,
      daysCount = 0,
      previous = getMonth(data[0].day);
    for( const {day, downloads} of data ) {
      currentMonth = getMonth(day);
      if( currentMonth !== previous || day === lastDay ) {
        result.push({month: previous, value: Math.round(acc / daysCount * 365/12)});
        acc = 0;
        daysCount = 0;
      }
      acc += downloads;
      daysCount++;
      previous = currentMonth;
    }
    return result;
  }),
};
const orNull = f => arg => f(arg) || null;

export default fns;