let sql = {};

sql.lastRequestPage = `
  SELECT data -> 'page'
    FROM outreq 
    ORDER BY id DESC 
    LIMIT 1
`;
sql.package_rawdata_Count = `
  SELECT COUNT(*) 
    FROM package_old 
    INNER JOIN outreq o on package_old.input_request = o.id
    WHERE o.endpoint = 2;
`;
sql.package_BatchList = `
  SELECT package.id, package.name FROM package
  LEFT OUTER JOIN
  (SELECT package FROM package_input WHERE source = $(source) ) AS downloaded
    ON package.id = downloaded.package
  WHERE downloaded.package IS NULL
  LIMIT $(batchSize)
`;
sql.package_input_Upsert = `
  INSERT INTO package_input as p ($(this~))
    VALUES ($(this:csv))
    ON CONFLICT (package, source)
      DO UPDATE SET
        outreq = EXCLUDED.outreq,
        data = EXCLUDED.data
  `;
module.exports = sql;