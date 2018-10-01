const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const {getTimestampDigits} = require('../../collector/util/vibl-util');

const ddlTemplatePath = path.join(__dirname, 'document-table-ddl.sql');

const tableFullName = process.argv[2];
const scriptDir = process.argv[3] || '.';

if( ! tableFullName.includes('.')) {
  console.log('Table name must start with a schema (and a dot).\nAborting.');
  process.exit();
}
const [schema, table] = tableFullName.split('.');

const timestamp = getTimestampDigits();

const createScript =  (script, direction) => {
  const fileName = `${timestamp}_create-${tableFullName}.${direction ? 'down' : 'up' }.sql`;
  const filePath = path.join(scriptDir, fileName);
  console.log(filePath);
  fs.writeFileSync(filePath, script);
};

const main = async () => {
  const ddlStr = fs.readFileSync(ddlTemplatePath, {encoding: 'utf8'});
  const ddlTemplate = _.template(ddlStr);
  const upScript = ddlTemplate({schema, table});
  const downScript = `DROP TABLE ${tableFullName};`;

  [upScript, downScript].forEach(createScript);

  process.exit();
};

main().then(console.log).catch(console.error);
