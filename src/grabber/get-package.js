const {q1} = require('../db');
const getData = require('./getPackageDataFromSource');

module.exports = async (sourceName, packName) => {
  const {source} = require(`./grab_${sourceName}`);
  const id = await q1([packName], `SELECT id FROM package WHERE name LIKE $1`);
  const pack = {
    id,
    name: packName,
  };
  return getData(source, pack);
};
