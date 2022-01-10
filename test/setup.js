const path = require('path');
const request = require('supertest');
const dotenv = require('dotenv');
const faker = require('faker');
const fs = require('fs');
const d = require('debug');
const _ = require('lodash');
const debug = d('axel:test:setup');

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// const Server = require('../src/common/server');


// const  SqlDB = require('axel-core/src/services/SqlDB.js');



// global.axel = axel;


const user = {
  username: faker.internet.userName(),
  email: faker.internet.email(),
  firstName: 'john',
  lastName: 'doe',
  password: 'passpass',
  accountType: 'provider'
};
console.log('NODE_ENV', process.env.NODE_ENV);
// console.log = () => null;
// console.warn = () => null;
// console.error = () => null;

debug('Setup start');
module.exports = async () => {
  let testStore = {};
  return await new Promise(async (resolve, reject) => {
    // @ts-ignore
    let axel = await import('axel-core');
    axel = axel.default || axel;
    // global.axel = axel.default || axel;
    // await axel.init();
    if (axel.config.logger) {
      axel.config.logger.level = 'warn';
    }
    const testConfig = {};
    import('./jestApp.js')
      .then(async (s) => {
        const server = await s.default;
        global.server = server;

        server.app.on('app-ready', async ({ axel2 }) => {
          debug('cleaning db');
          axel.logger.log('CLEAN DATABASE', process.env.DATABASE_NAME, axel.config && axel.config.sqldb);
          try {
            await axel.sqldb.query('set foreign_key_checks=0');
            axel.models['axelModelFieldConfig'].sync = () => Promise.resolve();
            axel.models['axelModelConfig'].sync = () => Promise.resolve();
            const promises = Object.values(axel.models).map((model) => {
              console.log('truncating', model.identity);

              return model.em.destroy({ truncate: true, cascade: false });
            })
            await Promise.all(promises);
            console.log('SYNCING Model');
            // await axel.sqldb.sync({ force: true, alter: true, logging: true })
            global.testApp = server.app;
          } catch (err) {
            axel.logger.warn(err);
            debug('cleaning db error', err.message);
            reject(err);
          }
          debug('CLEAN DATABASE DONE');
          await request(axel.app)
            .post('/api/user')
            // .set('Authorization', 'Bearer ' + axel.config.auth)
            .send(user)
            .then((data) => {
              if (data.status && data.status > 300) {
                reject(data.body);
                throw new Error('error_' + (data.body.message || data.status));
              }
              if (data.errors) {
                reject(data.errors);
                throw new Error('error_' + data.body.message);
              }

              testConfig.user = data.body.user;
              testConfig.auth = data.body.token;
              axel.config.auth = data.body.token;
              console.log("\n\n\n\n\n\n\n\n");
              console.log("________________________________________________");
              console.log("|____________________TOKEN_____________________|");
              console.log("________________________________________________");
              console.log(axel.config.auth);
              console.log("________________________________________________");
              console.log("\n\n\n\n\n\n\n\n");

              try {
                fs.writeFileSync(`${axel.rootPath}/tmp/testConfig.json`, JSON.stringify(testConfig, null, 2), { encoding: "utf8", flag: 'w' });
                console.log("JSON.stringify(testConfig, null, 2)", JSON.stringify(testConfig, null, 2));
                console.log("Config saved in ", `${axel.rootPath}/tmp/testConfig.json`);
                resolve();
              }
              catch (err) {
                reject(err);
              }

            })
            .catch(err => {
              console.log('err', Object.keys(err));
              reject(err);
              //process.exit(-1);
              if (err.data) {
                throw new Error('error_' + err.data.body.message);
              }
            });
        });
      })
      .catch(reject)
  });
};
