import { Application, NextFunction, IRoute } from 'express';
import { ExtendedError } from './src/axel';
import { Axel } from './src/axel';

import { Sequelize } from 'sequelize/types';

declare namespace Express {
  interface Request {
    user?: {
      roles: string[];
      email: string;
      username: string;
      [x: string]: any;
    };
    token?: string | { [key: string]: string };
    file: any;
  }
}

declare namespace NodeJS {
  interface Global {
    axel: Axel;
    ExtendedError: ExtendedError;
    sqldb: Sequelize;
    testConfig: Obj;
  }
}

declare const axel: Axel;

declare type Obj = { [key: string]: any };

export type AxelRoute =
  | string
  | {
      controller: string;
      action: string;
      secure?: boolean; // you need this if you defined you api as always secure !
    }
  | {
      view: string;
      secure?: boolean; // you need this if you defined you api as always secure !
    }
  | {
      view: string;
      secure?: boolean; // you need this if you defined you api as always secure !
    }
  | {
      use: IRoute;
    }
  | IRoute;
