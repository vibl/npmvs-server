const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const { init, getData } = require('./engine');

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
router.get('/p/:name', async (ctx) => {
  const data = await getData(ctx.params.id);
  ctx.body = data;
});
app
//.use(debug)
  .use(cors({origin:'*'}))
  .use(responseTime)
  .use(logger)
  .use(router.routes())
  .use(router.allowedMethods());

async function main() {
  await init();
  const port = process.env.SERVER_PORT;
  app.listen(port);
  return `Listening on port ${port}...`;
}
main().then(console.log).catch(console.log);
