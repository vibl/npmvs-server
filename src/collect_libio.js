
const {getMissingPackages} = require('./grabber/grab_libio_main');

const main = async () => {
  return getMissingPackages();
};

main().then(console.log).catch(console.error);
