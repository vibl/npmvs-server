const cp = require('child_process');
const {promisify} = require('util');
const exec = promisify(cp.exec);

const args = process.argv.slice(2);
// TODO: use Yargs or Commander and include an option for setting the sequence number or not (some tables
// don't have an idea, which breaks this script.
const fromOpt = args.shift();
const toOpt = args.shift();
const tables = args;

const main = async() => {
   for(let table of tables) {
     const command =
       `psql ${fromOpt} -c '\\copy ${table} to stdout' | psql ${toOpt} -c '\\copy ${table} from stdin' \
       && psql ${toOpt} -c "SELECT setval('${table}_id_seq', (SELECT max(id) FROM ${table}))"`;
     await exec(command);
   }
};
main().then(console.log).catch(console.error);
/*
fromOptions=$1
shift

toOptions=$1
shift

tables=

for table in "$@"; do
  #eval psql $fromOptions -c "'\\copy $table to stdout'" | eval psql $toOptions -c "'\\copy $table from stdin'"
eval psql $toOptions -c "'
done
*/
