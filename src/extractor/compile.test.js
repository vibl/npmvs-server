const compile = require('./compile');

const main = async () => {
  return compile('yobi');
};
main().then(console.log).catch(console.error);