const {q1} = require('../db');
const getData = require('./getPackageDataFromSource');

const endpointUrl = `https://api.npms.io/v2/package/`;
const source = {
  id: 2,
  name: 'nmps',
  getUrl: (packName) => endpointUrl + encodeURIComponent(packName.toLowerCase()),
};

const main = async (pack) => {
  pack.id = await q1([pack.name],
      `SELECT id FROM package WHERE name LIKE $1`);
  return getData(source, pack);
};
main({name: 'sanitize-filename'}).then(console.log).catch(console.error);