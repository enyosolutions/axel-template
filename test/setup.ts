import { resolve } from 'path';
import request from 'supertest';
import dotenv from 'dotenv';
import faker from 'faker';
const debug = require('debug')('axel:test:setup');

dotenv.config({ path: resolve(process.cwd(), '.env.test') });

// import Server from '../src/common/server';

import { axel } from '../src/axel';
import SqlDB from '../src/axel/services/SqlDB';

import server from '../src/index';
import { isJSDocEnumTag } from 'typescript';

axel.config.logger.level = 'warn';

declare const global: any;
global.server = server;
global.axel = axel;
global.testConfig = {};

const user = {
  username: faker.internet.userName(),
  email: faker.internet.email(),
  firstName: 'john',
  lastName: 'doe',
  password: 'passpass',
  accountType: 'provider'
};
const logger = axel.logger;
logger.log('NODE_ENV', process.env.NODE_ENV);
// console.log = () => null;
// console.warn = () => null;
// console.error = () => null;

debug('Setup start');
module.exports = async () => {
  let testStore: any = {};
  return await new Promise((resolve, reject) => {
    // @ts-ignore
    server.on('server-ready', async ({axel2}) => {
      debug('cleaning db');
      logger.log('CLEAN DATABASE', process.env.DATABASE_NAME, axel.config && axel.config.sqldb);
      try {
        await axel2.sqldb.sync({ force: true, alter: true, logging: true });
      } catch (err) {
        logger.warn(err);
        debug('cleaning db error', err.message);
        reject(err);
        process.exit(-1);
      }
      debug('CLEAN DATABASE DONE');
      await request(axel.app)
        .post('/api/user')
        // .set('Authorization', 'Bearer ' + axel.config.auth)
        .send(user)
        .then((data: Obj) => {
          if (data.status && data.status > 300) {
            console.log(data.body);
            reject(data.body);
            throw new Error('error_' + (data.body.message || data.status));
          }
          if (data.errors) {
            console.log(data.body);
            reject(data.errors);
            throw new Error('error_' + data.body.message);
          }

          global.testConfig.user = data.body.user;
          global.testConfig.auth = data.body.token;
          axel.config.auth = data.body.token;

          logger.log('global.testConfig', global.testConfig);
          resolve();
        })
        .catch(err => {
          console.log('err', Object.keys(err));
          reject(err);
          process.exit(-1);
          if (err.data) {
            throw new Error('error_' + err.data.body.message);
          }
        });
    });
  });
};
