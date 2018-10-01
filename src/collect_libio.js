
const grab_libio = require('../grabber/grab_libio_main');

const main = async () => {
  return grab_libio();
};

main().then(console.log).catch(console.error);
