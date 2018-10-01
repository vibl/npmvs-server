import {datapoints} from './datapoints';

const idFromPath = (level, path) => {
  const nameSegments = path.slice(path.length - level, path.length);
  return nameSegments.join('_');
};
// Pick datapoints, flatten them and give each an id based either on a provided id
// or on its path on the json source.
const recurse = (parent, parentPath, data) => {
  let acc = {};
  let key, node, nodePath, value, id;
  for (key in parent) {
    node = parent[key];
    nodePath = [...parentPath, key];
    value = data[key];
    if( typeof node === 'object' ) {
      if( value ) acc = {...acc, ...recurse(node, nodePath, value)};
    } else {
      id = typeof node === 'string' ? node : typeof node === 'number' ? idFromPath(node, nodePath) : null;
      if( ! id ) throw new Error('Could not find an id for node', node);
      acc[id] = value;
    }
  }
  return acc;
};
export default ({sourceName, packName, rawdata}) => {
  const data =
    datapoints(sourceName)
     ? recurse(datapoints(sourceName), [sourceName], rawdata)
     : rawdata;
  return {rawdata:{[packName]: data}};
}