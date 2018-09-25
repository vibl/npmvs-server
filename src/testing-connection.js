const Koa = require('koa');
const app = new Koa();

app.use(ctx => {
  ctx.body = 'Hello Koa';
});

const port = process.env.SERVER_PORT;

app.listen(port);
console.log(`Listening on port ${port}...`);

