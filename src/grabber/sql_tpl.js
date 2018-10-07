let sql = {};
sql.package_BatchList = `
  SELECT package.id, package.name FROM package
  LEFT OUTER JOIN
  (SELECT package_id FROM package_input WHERE source_id = $(source_id) ) AS downloaded
    ON package.id = downloaded.package_id
  WHERE downloaded.package_id IS NULL
  ORDER BY package.id
  LIMIT $(batchSize)
`;
sql.package_input_Upsert = `
  INSERT INTO package_input as p ($(this~))
    VALUES ($(this:csv))
    ON CONFLICT (package_id, source_id)
      DO UPDATE SET
        outreq_id = EXCLUDED.outreq_id,
        data = EXCLUDED.data
  `;
sql.outreq_update_received_now = `
  UPDATE outreq SET received = now(), error = $(error) WHERE id = $(id) RETURNING *
`;
module.exports = sql;