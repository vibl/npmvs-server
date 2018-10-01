const mem = require('memoize-immutable');
const extract = require('./extract');
const specs = require('./data-specs');
const {flatten, values} = require('ramda');
const {isString} = require('../')
const getPathsListBySource = mem( () => {
  let acc, spec, source, path;
  const pathsList = values(flatten(specs)).filter(isString);
  for(spec of specs) {
      [source, path] = spec.match(/(\w+)\.(.+)$/).slice(1);
      if( ! acc[source] ) acc[source] = [];
      acc[source].push(path);
    }
  }
  return acc;
});

const getPackageDataFromSource = (packName, source) => {
  return q({packName, source},
    `SELECT data FROM package_input_details
      WHERE package LIKE $(packName)
      AND source LIKE $(source)
      AND error IS NULL`
      );
};
const getAllData = (packName) => {
  let acc = {};
  for(source of ['npms', 'libio_main']) {
    acc[source] = getPackageDataFromSource(packName, source);
  }
  return acc;
};
const compileData = async (packName) => {
  const inputData = getAllData(packName);
  const fromNPMS = extract(['npms'], inputData);
  const fromLibioMain = specs.filter()
  return result;
};
module.exports = compileData();
