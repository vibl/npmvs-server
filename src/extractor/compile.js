// const extract = require('./extract');
const {getDataFromAllSources} = require('./get-data');
const getDotpathTree = require('./get-dotpath-tree');
const specs = require('./data-specs');
const {keys} = require('ramda');
const {indexValuesByDotpath} = require('../util/vibl-fp');

/*const extractData = (specs, dataIndex) => {
  let acc = {}, value;
  for(let key in specs ) {
    const spec = specs[key];
    if( typeof spec === 'string' ) {
      value = dataIndex[spec];
    } else if( Array.isArray(spec) ) {
      value = getValueFromFnSpec(spec, dataIndex);
    } else {
      throw new Error('A specs value should either be a string or an array. Found: ', typeof spec, spec);
    }
    acc[key] = value;
  }
};*/
const compileData = async (packName) => {
  const dotpathTree = getDotpathTree(specs);
  const sources = keys(dotpathTree);
  const inputData = await getDataFromAllSources(sources, packName);
  const index = indexValuesByDotpath(dotpathTree, inputData);
  return index;
};
compileData('react');
module.exports = compileData();
