
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


module.exports = extractData;
