
const {getMissingPackages} = require('./grabber/grab_npm_downloads');

const main = async () => {
  return getMissingPackages();
};

main().then(console.log).catch(console.error);
