const compile = require('./compile');

const main = async () => {
  return compile('mocha');
};
main().then(console.log).catch(console.error);