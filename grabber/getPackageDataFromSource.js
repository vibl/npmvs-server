const {q, insert} = require('../src/db');
const http = require('../http');
const sql = require('./sql_tpl');
const {getTimestamp} = require('../util/vibl-util');

const logResponse = (outreq) => q(outreq,
  `UPDATE outreq SET received = now(), error = $(error) WHERE id = $(id) RETURNING *`);

module.exports = async (source, pack) => {
  let [outreq] = await insert({received: null}, 'outreq');
  const url = source.getUrl(pack.name);
  try {
    const {data} = await http.getSanitized(url);
    [outreq] = await logResponse(outreq);
    await q({package:pack.id, source: source.id, outreq:outreq.id, data}, sql.package_input_Upsert);
  }
  catch(err) {
    let error;
    if( err.response ) {
      status = err.response.status;
      await logResponse({...outreq, status});
      if( [400, 404, 500].includes(status) ) {
        // Insert a row with an empty `data` field. DO NOT update existing rows!
        await q({package:pack.id, source: source.id, outreq:outreq.id, data: null},
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