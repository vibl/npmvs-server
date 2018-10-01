
const pathIndexer = (parent, parentPath) => {
  let acc = {};
  let key, node, path;
  for (key in parent) {
    node = parent[key];
    path = parentPath + '.' + key;
    if (typeof node === 'object') {
      acc = {...acc, ...pathIndexer(source, node, path)};
    } else {
      acc[path] = node;
    }
  }
  return acc;
};
const getIndex =
  (source, data) => pathIndexer(data, [source]);

const getFullIndex = (sources) => {
  return sources.reduce(
    (acc, data, sourceName) =>
      ({...acc, ...getIndex(sourceName, data)})
  )
};
const getValueFromFnSpec = (spec, dataIndex) => {
  const argsPaths = spec.slice(0, -1);
  const fn = spec.slice(-1)[0];
  if (typeof fn !== 'function') {
    throw new Error('Last element of a spec array should be a function');
  }
  const args = argsPaths.map( s => dataIndex[s]);
  return fn(...args);
};
const extractData = (specs, sources) => {
  let acc = {}, value;
  const dataIndex = getFullIndex(sources);
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
};
module.exports = extractData;
