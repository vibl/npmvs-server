const fs = require('fs');
const {parser} = require('stream-json');
const {streamArray} = require('stream-json/streamers/StreamArray');
const {dbP, pgp} = require('../../db');

const filePath = '/home/vianney/dev/idea/npmvs/server/src/db/import/all-npm-packages-names.json';
let queue = [];
let isStreamOpen = true;
const pageSize = 1000;

const pushData = (data) => {
  queue.push({name: data.value});
};

const stream = fs.createReadStream(filePath)
  .pipe(parser())
  .pipe(streamArray())
  .on('data', pushData);

const getNextData = async (t, index) => {
  return queue.splice(0, pageSize);
};
// function* getNextData(t, index) {
//   while(true) {
//     yield queue.splice(0, pageSize);
//   }
// };

const columnSet = new pgp.helpers.ColumnSet(['name'], {table: 'package'});

const main = async() => {
  const db = await dbP;
  db.tx('massive-insert', t => {
    return t.sequence(index => {
      return getNextData(t, index)
        .then(data => {
          if (data && data.length > 0) {
            const insert = pgp.helpers.insert(data, columnSet);
            return t.none(insert);
          }
        });
    });
  })
};

main().then(data => {
  // COMMIT has been executed
  console.log('Ended', data);
})
  .catch(error => {
    // ROLLBACK has been executed
    console.log(error);
  });
