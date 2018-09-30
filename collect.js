const grab_npms = require('./grabber/grab_npms');
const grab_libio = require('./grabber/grab_libio');

const main = async () => {
  Promise.all([
    grab_npms(),
    grab_libio(),
  ])
};

main().then(console.log).catch(console.error);
