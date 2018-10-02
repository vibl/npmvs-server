const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
// const { init, getDowloadsData } = require('./engine');
const getPackageData = require('./extractor/compile');

require('dotenv').config();

const app = new Koa();
const router = new Router();

const logger = async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
};
const debug = async (ctx, next) => {
  console.log('Request ctx:', ctx);
  await next();
  console.log('Reply ctx:', ctx);
};
const responseTime = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
};
router.get('/package/:packName', async (ctx) => {
  const data = await getPackageData(ctx.params.packName);
  ctx.body = data;
});
// router.get('/downloads/:packName', async (ctx) => {
//   const data = await getDowloadsData(ctx.params.packName);
//   ctx.body = data;
// });
app
//.use(debug)
  .use(cors({origin:'*'}))
  .use(logger)
  .use(responseTime)
  .use(router.routes())
  .use(router.allowedMethods());

async function main() {
  // await init();
  const port = process.env.SERVER_PORT;
  app.listen(port);
  return `Listening on port ${port}...`;
}
main().then(console.log).catch(console.log);
