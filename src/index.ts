import './common/env';
import { axel, Server, models, router } from './axel';
import { beforeFn, afterFn } from './common/bootstrap';
import middlewares from './common/middlewares';

declare let global: any;

const port: number =
  (process.env.PORT ? parseInt(process.env.PORT) : 0) || axel.config.port || 3333;

global.axel = axel;
axel.port = port;

const app = new Server()
  .setMiddlewares(middlewares)
  .router(router)
  .models(models)
  .before(beforeFn)
  .after(afterFn)
  .listen(port);

export default app;
