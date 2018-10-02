require('dotenv').config();
const pgp = require('pg-promise')({});

const dbP = pgp(process.env.NPMVS_DB);
let db;

const q = async (arg1, arg2) => {
  let params, sql;
  if( arg2 ) {
    params = arg1;
    sql = arg2;
  } else {
    sql = arg1;
  }
  db = db || await dbP;
  let res = await db.query(sql, params);
  // If the result(s) are/is object(s) with just one key, get rid of the key and get only the value.
  const testSample = Array.isArray(res) ? res[0] : res;
  if( testSample) {
    const keys = Object.keys(testSample);
    if( keys.length === 1 ) {
      res = res.map( o => o[keys[0]]);
    }
  }
  return res;
};
const oneResult = (fn) => async (...args) => {
  const res = await fn(...args);
  return res[0];
};
const insert = (data, ...rest) => {
  // If there is only one string argument in the rest, consider it as the table name (and so place
  // a null argument for the column just before it, which is required by pgp.helpers.insert)
  if( ! rest[1] && typeof rest[0] === 'string' ) rest.unshift(null);
  const sql = pgp.helpers.insert(data, ...rest) + ' RETURNING *';
  return q(sql);
};
const q1 = oneResult(q);
const insert1 = oneResult(insert);

// TODO: take another shot at this function basing it on helpers.insert:
// https://github.com/vitaly-t/pg-promise/blob/ee34110368f29b14f913665e8803c86361ec3f00/lib/helpers/methods/insert.js
// const upsert = (data, conflictColumns, ...rest) => {
//   // If there is only one string argument in the rest, consider it as the table name (and so place
//   // a null argument for the column just before it, which is required by pgp.helpers.insert)
//   const {ColumnSet} = pgp.helpers;
//   if( ! rest[1] && typeof rest[0] === 'string' ) rest.unshift(null);
//   if( rest[0] instanceof ColumnSet) {
//     cs = rest[0];
//   } else {
//
//   }
//   const cs new ColumnSet(['name'], {table: 'package'});
//   const sqlInsert = pgp.helpers.insert(data, ...rest);
//   const sqlConflict = ` ON CONFLICT ($(${conflictColumns}~)) DO UPDATE SET ` +
//     cs.assignColumns({from: 'EXCLUDED', skip: conflictColumns});
//   const sql = sqlInsert + sqlConflict;
//   return q(sql);
// };
//TODO: include other pg-promise query methods
// https://github.com/vitaly-t/pg-promise#methods
module.exports = {
  dbP,
  pgp,
  q,
  q1,
  insert,
  insert1,
};
