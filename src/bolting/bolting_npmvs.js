const {q} = require('../db');
const http = require('../http');
const {omit} = require('ramda');
const sql = require('./bolting_sql');
const fs = require('../util/vibl-fs');


const itemsPerRequest = 10;
const totalPages = 5000;
let totalPackages = allPackagesNames.length; // Adjusted from the responses.

// const endpointUrl = `https://api.npms.io/v2/search`;
// const baseUrl = `${endpointUrl}?q=not:deprecated+popularity-weight:100&size=${perPage}`;

const endpointUrl = `https://api.npms.io/v2/package/mget`;
const url = endpointUrl;
const endpointId = 2;
const timerStart = Date.now();

const preparePackagesDataForUpsert = ({package: packData}) => {
  return [
    packData.name,
    request.id,
    {npms: packData},
  ]
};
const getResponseStats = ({requestTimestamp, request, totalCount}) => {
  const respTime = (Date.now - requestTimestamp) / 1000;
  const elapsed = (Date.now() - timerStart) / 1000;
  const speed = Math.round(totalCount / elapsed * 3600);
  return `${request.created_at}, ${elapsed} sec, ${respTime} sec, ${speed} items/h`;
};
const getData = async ({packagesIds, request, timerStart}) => {
  const requestTimestamp = Date.now();
  const resp = await http.post(url, packagesIds);
  const {headers, data: {total, results}} = resp;
  totalPackages = total;
  const count = results && results.length ? results.length : 0;
  totalCount += count;
  if( resp.status === 200 ) {
    console.log(getResponseStats({requestTimestamp, totalCount, timerStart, request, resp}));
  } else {
    console.log(`${request.created_at}, STATUS: ${resp.status}`)
  }
  await q({id: request.id},
    `UPDATE public.outreq SET received = now() WHERE id = $(id)`);
  await q({id: request.id, data: {response: headers}},
    `UPDATE outreq SET data = data || $(data) WHERE id = $(id)`);
  await q(results.map(preparePackagesDataForUpsert),
    sql.packages_rawdata_upsertMultiple);
};
const main = async () => {
  let totalCount = 0;
  // const [{count: packageRawdataRowCount}] = await q([endpointId],
  //   `SELECT COUNT(*) FROM package_rawdata p
  //     INNER JOIN out_request o on p.out_request = o.id WHERE o.endpoint = $1;`);
  // const offsetStart = Math.floor(packageRawdataRowCount);
  const downloadedPackages = q([endpointId],
    `SELECT id FROM package_old p WHERE o.endpoint = $1;`);

  const packagesToDownload = [];
  for (let offset = offsetStart; offset < totalPackages; offset += itemsPerRequest) {
    const packagesIds = ['victory', 'react-vis', 'recharts'];
    const request = await q([[endpointId, url, {packagesIds}]],
      `INSERT INTO outreq (endpoint, url, data) VALUES ($1:csv) `
    );
    try {
      await getData({url, packagesIds, request, timerStart, totalCount});
    }
    catch (err) {
      console.log(err);
    }
  }
};
main().then(console.log).catch(console.error);
