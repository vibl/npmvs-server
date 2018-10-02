const {q1} = require('../db');

const sql_package_data_from_source =  `
  SELECT data FROM package_input_details
      WHERE package LIKE $(packName)
      AND source LIKE $(source)
      AND error IS NULL
`;
const getDataFromAllSources = async (sources, packName) => {
  let acc = {};
  for(source of sources) {
    acc[source] = await q1({packName, source}, sql_package_data_from_source);
  }
  return acc;
};
module.exports = {
  getDataFromAllSources,
};