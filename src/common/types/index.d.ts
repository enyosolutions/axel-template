declare namespace Express {
  interface Request {
    user?: any;
    token?: string;
  }
}

declare type Obj = { [key: string]: any };

declare module 'replace';