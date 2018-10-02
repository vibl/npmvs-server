
const {getMissingPackages} = require('./grabber/grab_npms');

const main = async () => {
  return getMissingPackages();
};

main().then(console.log).catch(console.error);
