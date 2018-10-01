const {q} = require('./db');
const config = require('config');
const getData = require('./grabber/getPackageDataFromSource');

const endpointUrl = `https://api.npms.io/v2/package/`;
const source = {
  id: 2,
  getUrl: (packName) => endpointUrl + encodeURIComponent(packName.toLowerCase()),
};

const main = async (pack) => {
  pack.id = await q([pack.name],
      `SELECT id FROM package WHERE name LIKE $1`);
  return getData(source, pack);
};
main({name: 'lbdc-first-npm'}).then(console.log).catch(console.error);