const addMonths = require('date-fns/add_months');
const format= require('date-fns/format');

const firstAvailableDate = new Date('2015-01-10');

const getRanges = () => {
  let acc = [], startDate = firstAvailableDate, endDate, range;
  while(true) {
    endDate = addMonths(startDate, 18);
    range = [startDate, endDate].map(date => format(date, 'YYYY-MM-DD')).join(':');
    acc.push(range);
    startDate = endDate;
    if( startDate > new Date() ) break;
  }
  return acc;
};
const ranges = getRanges();