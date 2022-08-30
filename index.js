require('dotenv').config();
const {
  axel, Server
} = require('axel-core');

const middlewares = require('./src/middlewares');
const { beforeFn, afterFn } = require('./src/bootstrap');
const MailService = require('./src/api/services/common/MailService');


// eslint-disable-next-line
const port = (process.env.PORT ? parseInt(process.env.PORT) : 0)
  || axel.config.port
  || 3333;

axel.port = port;
axel.services.mailService = MailService;

const server = new Server()
  .setMiddlewares(middlewares)
  .before(beforeFn)
  .after(afterFn);

server.start();
server.listen(port);

module.exports = server.app;
