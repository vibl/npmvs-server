const massive = require('massive');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const dbConfig = {
  host: '0.0.0.0',
  port: 5432,
  database: 'npmvs',
  user: 'postgres',
  password: 'h4HzEQ65dYpN'
};

const fullTableName = process.argv[2];
const scriptDir = process.argv[] || '.';

const pgDumpCmd =
  `pg_dump
  --schema-only
  --host=${dbConfig.host}
  --port=${dbConfig.port}
  --username=${dbConfig.user}
  --dbname=${dbConfig.database}
  --table=${fullTableName}
  `.replace(/\n/gm, '');

const timestamp = (new Date()).toJSON().replace(/\D/g,'').slice(0,-3);

const createScript =  (script, direction) => {
  const fileName = `${timestamp}_create-${fullTableName}.${direction ? 'down' : 'up' }.sql`;
  const filePath = path.join(scriptDir, fileName);
  console.log(filePath);
  fs.writeFileSync(filePath, script);
};

const main = async () => {
  const db = await massive(dbConfig);
  const [{to_regclass: tableExisted}] = await db.query(`SELECT to_regclass('${fullTableName}');`);
  if( ! tableExisted ) {
    await db.saveDoc(fullTableName, {});
  } else {
    console.log('Table already exists. It may not be the one you want. Check the scripts...');
  }
  const stdout = cp.execSync(pgDumpCmd, {encoding: 'utf8'});
  const upScript = stdout
    .replace(/^--.*/gm, '')
    .replace (/\n\n\n+/gm, '\n\n')
    .replace (/\n\n\n+/gm, '\n\n');

  const downScript = `DROP TABLE ${fullTableName};`;

  [upScript, downScript].forEach(createScript);

  if( ! tableExisted ) {
    await db.query(`DROP TABLE ${fullTableName};`);
  }

  process.exit()
};

main().then(console.log).catch(console.error);
