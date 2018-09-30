
const grab_npms = require('./grabber/grab_npms');

const main = async () => {,
  return grab_npms();
};

main().then(console.log).catch(console.error);
