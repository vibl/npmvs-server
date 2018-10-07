const compile = require('./compile');

const main = async () => {
  return compile('create-react-class');
};
main().then(console.log).catch(console.error);