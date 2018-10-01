const http = require('../http');

const endpointUrl = `https://api.npms.io/v2/package/`;

const main = async (pack) => {
  const url = endpointUrl + encodeURIComponent(pack.name.toLowerCase());
  try {
    const {data} = await http.getSanitized(url);
}
main({name: }).then(console.log).catch(console.error);