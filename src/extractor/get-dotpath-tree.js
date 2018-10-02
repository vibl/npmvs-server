const mem = require('memoize-immutable');
const {filter, flatten, pipe, values} = require('ramda');
const {isString, getDotpathTreeFromDotpathList, } = require('../util/vibl-fp');

/*const getDotpathList = (specs) => {
  let res = [];
  let specsValues = values
  for(key )
};

const getDotpathTreeFromSpecs = (specs) => {
  const dotpathList = getDotpathList(specs);
  return getDotpathTreeFromDotpathList(dotpathList);
};

module.exports = mem(getDotpathTreeFromSpecs);*/

module.exports = mem(
  pipe(
    values,
    flatten,
    filter(isString),
    getDotpathTreeFromDotpathList,
  ),
);
