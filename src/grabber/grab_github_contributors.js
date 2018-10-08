const addMonths = require('date-fns/add_months');
const format= require('date-fns/format');
const pMap = require('p-map');
const {q, q1, insert1} = require('../db');
const sql = require('./sql_tpl');
const secrets = require('../secrets');
const http = require('../http');
const {flatten} = require('lodash');
const {getTimestamp, throttleSleeper} = require('../util/vibl-util');

const batchSize = 1000;
const concurrency = 5;
// const rateLimit = 10; // Requests per second.
// const minRequestDuration = 1000 / rateLimit; // In ms.
// const throttleSleep = throttleSleeper(minRequestDuration);
const apiToken = secrets.apiTokens.github[0];

const source = {
  id: 4,
  name: 'github_contributors',
};

const logResponse = (outreq) => q1(outreq, sql.outreq_update_received_now);
const getUrl = (githubRepoId) => `https://api.github.com/repos/${githubRepoId}/stats/contributors`;

const getGithubRepo = (pack) => {
  const whereCondition = typeof pack === 'number' ? 'id = ${pack}' : 'name LIKE ${pack}';
  return q1({pack}, `SELECT github_repo FROM package WHERE ${whereCondition}`);
};
const getData = async (source, pack) => {
  let outreq = await insert1({received: null}, 'outreq');
  console.log('Downloading data for package:', pack.name);
  const githubRepo = await getGithubRepo(pack.id);
  const url = getUrl(githubRepo);
  //TODO: gérer la situation où le repoId a changé (redirection). Exemple: 'uber-common/react-vis' => 'uber/react-vis'
  try {
    const data = await http.getData(url);
    outreq = await logResponse(outreq);
    // I could not find a way to insert an array in a jsonb column, so we must wrap it in an object here.
    await q({package_id:pack.id, source_id: source.id, outreq_id:outreq.id, data},
      sql.package_input_Upsert);
  }
  catch(err) {
    let error;
    if( err.response ) {
      status = err.response.status;
      await logResponse({...outreq, status});
      if( [400, 404, 500].includes(status) ) {
        // Insert a row with an empty `data` field. DO NOT update existing rows!
        await q({package_id:pack.id, source_id: source.id, outreq_id:outreq.id, data: null},
          `INSERT INTO package_input as p ($(this~)) VALUES ($(this:csv)) ON CONFLICT DO NOTHING`);
      } else {
        error = status;
      }
    } else {
      error = err;
    }
    console.log(`${getTimestamp()}: ${source.name} : ERROR ${error} (${url})`);

  }
};
const getDataTask = (pack) => getData(source, pack);

const getMissingPackages = async () => {
  console.log('Grabbing data from NPM Downloads...');
  while(true) {
    const batch = await q({source_id: source.id, batchSize}, sql.package_BatchList);
    if( batch.length === 0 ) break;
    try {
      await pMap(batch, getDataTask, {concurrency});
    }
    catch (err) {
      console.log(err);
    }
  }
};
module.exports = {
  source,
  getMissingPackages,
};
