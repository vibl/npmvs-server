
const grab_libio = require('./grabber/grab_libio');

const main = async () => {
  return grab_libio();
};

main().then(console.log).catch(console.error);
