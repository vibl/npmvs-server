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
