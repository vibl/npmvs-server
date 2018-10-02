const ChangesStream = require('changes-stream');

const db = 'https://replicate.npmjs.com';

const changes = new ChangesStream({
    db: db,
   include_docs: true,
  since: 6289325,
});
changes.on('data', function(change) {
  console.log(change);
});
