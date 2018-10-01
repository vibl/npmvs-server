import rawSpecs from './gather-specs';
import store from './store';
const {assocColPath} = require('../util/vibl-fp');

let jobs;

// const recurse = (parent, parentPath = []) => {
//   let acc = {};
//   let key, node, path;
//   for (key in parent) {
//     node = parent[key];
//     path =  [...parentPath, key];
//     if( Array.isArray(node) ) {
//       const [datapoint, extractFn] = node;
//       const [source, datapointId] = datapoint.split(':');
//       if( ! acc[source] ) acc[source] = {};
//       acc[source][datapointId] = {extractFn, path};
//     } else {
//       if( typeof node !== 'object' ) throw new Error('Field specs must only contains nodes of type object or arrays');
//       acc = {...acc, ...recurse(node, path)};
//     }
//   }
//   return acc;
// };

const getJobs = () => {
  if( ! jobs ) {
    let acc = [];
    for(const specId in rawSpecs) {
      const spec = rawSpecs[specId];
      for(const storePath in spec) {
        const fields = spec[storePath];
        for(const field of fields) {
          const {id, datapoint, extractFn} = field;
          const pathTemplate =  storePath + ':' + id;
          acc.push({datapoint, extractFn, pathTemplate});
        }
      }
    }
    jobs = acc;
  }
  return jobs;
};
const getPath = (pathTemplate, params) => {
  let str = pathTemplate;
  for(const paramKey in params) {
    const value = params[paramKey];
    str = str.replace(`{${paramKey}}`, value);
  }
  return str;
};
const extract = (data, params) => {
  const jobs = getJobs();
  const state = store.get();
  let acc = {};
  for(const {datapoint, extractFn, pathTemplate} of jobs) {
    let value = data[datapoint];
    const path = getPath(pathTemplate, params);
    if( extractFn ) value = extractFn({value, params, path, state, data});
    acc = assocColPath(path, value, acc);
  }
  return acc;
};
export default extract;