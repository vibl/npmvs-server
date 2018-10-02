const {q, q1, insert1} = require('../db');
const http = require('../http');
const sql = require('./sql_tpl');
const {getTimestamp} = require('../util/vibl-util');

const logResponse = (outreq) => q1(outreq, sql.outreq_update_received_now);
// Postgres does not support the null byte character in JSON (https://docs.postgresql.fr/9.4/release-9-4-1.html),
// so we need to remove it but also it representation "\\u0000", which would be converted
// in the null byte by JSON.parse.
// The second part of the | alternative `([^\\])\\u0000` has a sort of 'look-behind' (which does not
// exist natively in js). This look-behind excludes a double set of slashes (\\) because that's an escape
// of an escape character, which means the string '\u0000' is meant literally in the text (probably in some
// code example).
const sanitize = (data) => data.replace(/(\0|([^\\])\\u0000)/g, '$2');

module.exports = async (source, pack) => {
  let outreq = await insert1({received: null}, 'outreq');
  const url = source.getUrl(pack.name);
  try {
    const {data: rawDataStr} = await http.get(url, {transformResponse:x=>x});
    const dataStr = sanitize(rawDataStr);
    const data = JSON.parse(dataStr);
    outreq = await logResponse(outreq);
    await q({package_id:pack.id, source_id: source.id, outreq_id:outreq.id, data}, sql.package_input_Upsert);
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