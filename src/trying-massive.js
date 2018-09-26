const massive = require('massive');

const dbConfig = {
  host: '0.0.0.0',
  port: 5432,
  database: 'npmvs',
  user: 'postgres',
  password: '%2M7xn9tM@Y'
};


const main = async () => {
  const db = massive(dbConfig);

};

main().then(console.log).catch(console.error);

