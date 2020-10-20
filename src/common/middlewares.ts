import morgan from 'morgan';
import helmet from 'helmet';
import addRequestId from 'express-request-id';
import compression from 'compression';

import { tokenDecryptMiddleware } from './services/AuthService';
import { Request, Response } from 'express';

const middleWares: any = {
  'token-decript': tokenDecryptMiddleware,
  morgan: morgan('dev', {
    skip(req: Request, res: Response) {
      return res.statusCode < 400;
    },
  }),

  helmet: helmet(),
  addRequest: addRequestId(),
  compression: compression(),
};

export default middleWares;
