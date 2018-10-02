
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

module.exports = extractData;
