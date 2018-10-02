// const extract = require('./extract');
const {getDataFromAllSources} = require('./get-data');
const getDotpathTree = require('./get-dotpath-tree');
const specs = require('./data-specs');
const {keys} = require('ramda');
const {indexValuesByDotpath} = require('../util/vibl-fp');

const getValueFromFnSpec = (spec, dataIndex) => {
  const argsPaths = spec.slice(0, -1);
  const fn = spec.slice(-1)[0];
  if (typeof fn !== 'function') {
    throw new Error('Last element of a spec array should be a function');
  }
  const args = argsPaths.map( s => dataIndex[s]);
  return fn(...args);
};

const mapSpecsToIndex = (specs, index) => {
  let acc = {}, value;
  for(let key in specs ) {
    const spec = specs[key];
    if( typeof spec === 'string' ) {
      value = index[spec]; // `spec` must be a path, so just take the corresponding value from the index.
    } else if( Array.isArray(spec) ) {
      value = getValueFromFnSpec(spec, index);
    } else {
      throw new Error('A specs value should either be a string or an array. Found: ', typeof spec, spec);
    }
    acc[key] = value;
  }
  return acc;
};
module.exports = async (packName) => {
  const dotpathTree = getDotpathTree(specs);
  const sources = keys(dotpathTree);
  console.time('Compile');
  const inputData = await getDataFromAllSources(sources, packName);
  const index = indexValuesByDotpath(dotpathTree, inputData);
  const data = mapSpecsToIndex(specs, index);
  console.timeEnd('Compile');
  return data;
};
