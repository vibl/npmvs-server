const getPackage = require('./get-package');

getPackage('libio_main', 'brow-route')
  .then(console.log)
  .catch(console.error);