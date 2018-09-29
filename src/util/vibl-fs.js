const fs = require('fs-extra');
const path = require('path');
const {curry2} = require('./vibl-fp');

async function readdirFullPath(dir) {
  const files = await fs.readdir(dir);
  return files.map( file => path.join(dir, file) );
}
async function isFile(file) {
  const stat = await fs.stats(file);
  return stat.isFile();
}
function readFileU(filePath) {
  return fs.readFile(filePath, {encoding: 'utf8'})
}

function readStream(filePath) {
  return fs.createReadStream(filePath, {encoding: 'utf8'});
}

const writeFile = curry2(fs.writeFile);
const writeJson = curry2(fs.writeJson);
const writeJsonPretty = curry2((filePath, obj) => fs.writeJson(filePath, obj, {spaces: 4}));


module.exports = {
  ...fs,
  isFile,
  readdirFullPath,
  readFileU,
  readStream,
  path,
  writeFile,
  writeJson,
  writeJsonPretty,
};