const request = require('supertest');
const faker = require('faker');
const jsf = require('json-schema-faker');
const model = require('../../src/api/models/schema/user');
const { app } = require('../../src/server');

// @ts-ignore
const axel = global.axel || require('axel-core');

jsf.extend('faker', () => faker);
jsf.option('optionalsProbability', 0.3);
jsf.option('ignoreProperties', ['createdOn', 'lastModifiedOn', axel.config.framework.primaryKey]);

// @ts-ignore
const testConfig = require(`${axel.rootPath}/tmp/testConfig.json`);

global.testStore = {};

describe('user APIS TESTING :: ', () => {
  const entity = 'user';
  const entityApiUrl = '/api/user';
  const primaryKey = axel.config.framework.primaryKey;


  beforeAll(async (done) => {
    app.on('app-ready', () => {
      console.log('TESTS:: beforeAll tests on ');
      const data = jsf.generate(model.schema);
      data.password = `${Date.now()}`;
      request(app)
        .post(entityApiUrl)
        .set('Authorization', `Bearer ${testConfig.auth}`)
        .send(data)
        .then((response) => {
          if (response.error || response.body.message) {
            console.log('[RESPONSE: ERROR]', response.error);
            return done(response.error);
          }
          global.testStore.savedData = response.body.user;
          done();
        })
        .catch((err) => {
          console.error(err);
          done(err);
        });
    });
  });

  // POST
  describe('#POST() :: ', () => {
    describe('WITHOUT FIELD :: ', () => {
      model.schema.required.forEach((field) => {
        describe(`${field} :: `, () => {
          it('should give 400 error', (done) => {
            const data = jsf.generate(model.schema);
            delete data[field];
            request(app)
              .post(entityApiUrl)
              .set('Authorization', `Bearer ${testConfig.auth}`)
              .send(data)
              .expect(400)
              .then((response) => {
                expect(response.body.body).toBeUndefined();
                done();
              })
              .catch((err) => {
                axel.logger.error(err);
                done(err);
              });
          });
        });
      });
    });

    describe('WITH PROPER DATA :: ', () => {
      it('should add values and return the data', (done) => {
        const data = jsf.generate(model.schema);
        data.password = `${Date.now()}`;
        request(app)
          .post(entityApiUrl)
          .set('Authorization', `Bearer ${testConfig.auth}`)
          .send(data)
          .expect(201)
          .then((response) => {
            if (response.error || response.body.message) {
              console.log('[RESPONSE: ERROR]', response.error);
              return done(response.body.message || response.error);
            }
            expect(response.body).toBeDefined();
            expect(response.body.user).toBeDefined();
            expect(response.body.user[primaryKey]).toBeDefined();
            for (const key in model.schema.required) {
              if ([primaryKey, 'lastModifiedOn', 'createdOn'].indexOf(key) !== -1) {
                continue;
              }
              expect(response.body.user[key]).toBe(data[key]);
            }
            done();
          })
          .catch((err) => {
            axel.logger.error(err);
            done(err);
          });
      });

      // ADD SECOND DATA WITH DIFFERENT POST VALUES
      it('should add values and return the data 2', async (done) => {
        const data = jsf.generate(model.schema);
        data.password = `${Date.now()}`;
        try {
          const response = await request(app)
            .post(entityApiUrl)
            .set('Authorization', `Bearer ${testConfig.auth}`)
            .send(data)
            .expect(201);
          if (response.error || response.body.message) {
            console.log('[RESPONSE: ERROR]', response.error);
            return done(response.body.message || response.error);
          }
          expect(response.body).toBeDefined();
          expect(response.body.user).toBeDefined();
          expect(response.body.user[primaryKey]).toBeDefined();
          for (const key in model.schema.required) {
            if ([primaryKey, 'lastModifiedOn', 'createdOn'].indexOf(key) !== -1) {
              continue;
            }
            expect(response.body.user[key]).toBe(data[key]);
          }
          done();
        } catch (err) {
          console.error(err);
          done(err);
        }
      });
    });
  });

  // LIST
  describe('#LIST() :: ', () => {
    describe('WITHOUT TOKEN :: ', () => {
      it('should give 401 error', (done) => {
        request(app)
          .get(entityApiUrl)
          .expect(401)
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });

    describe('WITH PROPER DATA :: ', () => {
      describe('WITHOUT LOV :: ', () => {
        it('should give list with default pagination', (done) => {
          request(app)
            .get(entityApiUrl)
            .set('Authorization', `Bearer ${testConfig.auth}`)
            .expect(200)
            .then((response) => {
              expect(response.body.body.length).toBeGreaterThan(0);
              expect(response.body.page).toBe(0);
              expect(response.body.count).toBe(axel.config.framework.defaultPagination);
              expect(response.body.totalCount).toBeGreaterThan(0);
              done();
            })
            .catch((err) => {
              console.error(err);
              done(err);
            });
        });
      });

      describe('WITH LOV :: ', () => {
        it('should give list with lov pagination', (done) => {
          request(app)
            .get(`${entityApiUrl}?listOfValues=true`)
            .set('Authorization', `Bearer ${testConfig.auth}`)
            .expect(200)
            .then((response) => {
              expect(response.body.body.length).toBeGreaterThan(0);
              expect(response.body.page).toBe(0);
              expect(response.body.count).toBe(axel.config.framework.defaultLovPagination);
              expect(response.body.totalCount).toBeGreaterThan(0);
              done();
            })
            .catch((err) => {
              console.error(err);
              done(err);
            });
        });
      });
    });
  });

  // UPDATE
  describe('#UPDATE() :: ', () => {
    describe('WITHOUT TOKEN :: ', () => {
      it('should give 401 error', (done) => {
        const data = jsf.generate(model.schema);
        if (!testStore.savedData) {
          console.log('testStore', testStore);
          done('missing_test_data');
          // process.exit(JSON.stringify(testStore));
        }
        request(app)
          .put(`${entityApiUrl}/${testStore.savedData[primaryKey]}`)
          .send(data)
          .expect(401)
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });

    describe('WRONG ID :: ', () => {
      it('should give 404 error', (done) => {
        const data = jsf.generate(model.schema);
        request(app)
          .put(`${entityApiUrl}/wrong${testStore.savedData[primaryKey]}`)
          .set('Authorization', `Bearer ${testConfig.auth}`)
          .send(data)
          .expect(404)
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });
  });

  // GET
  describe('#GET() :: ', () => {
    describe('WITHOUT TOKEN :: ', () => {
      it('should give 401', (done) => {
        request(app)
          .get(`${entityApiUrl}/${testStore.savedData[primaryKey]}`)
          .expect(401)
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });

    describe('WRONG ID :: ', () => {
      it('should give 404 error', (done) => {
        request(app)
          .get(`${entityApiUrl}/wrong${testStore.savedData[primaryKey]}`)
          .set('Authorization', `Bearer ${testConfig.auth}`)
          .expect(404)
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });

    describe('PROPER DATA :: ', () => {
      it('should return value (extended)', (done) => {
        request(app)
          .get(`${entityApiUrl}/${testStore.savedData[primaryKey]}`)
          .set('Authorization', `Bearer ${testConfig.auth}`)
          .expect(200)
          .then((response) => {
            if (response.error || response.body.message) {
              console.log('[RESPONSE: ERROR]', response.error);
              return done(response.error);
            }
            expect(response.body.body).toBeDefined();
            expect(response.body.body[primaryKey]).toBeDefined();
            for (const key in model.schema.required) {
              if ([primaryKey, 'lastModifiedOn', 'createdOn'].indexOf(key) !== -1) {
                continue;
              }
              expect(response.body.body[key]).toBe(testStore.savedData[key]);
            }
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });
  });

  // DELETE
  describe('#DELETE() :: ', () => {
    describe('WITHOUT TOKEN :: ', () => {
      it('should give 401', (done) => {
        request(app)
          .delete(`${entityApiUrl}/${testStore.savedData[primaryKey]}`)
          .expect(401)
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });

    describe('WRONG ID :: ', () => {
      it('should give 404 error', (done) => {
        request(app)
          .delete(`${entityApiUrl}/wrong${testStore.savedData[primaryKey]}`)
          .set('Authorization', `Bearer ${testConfig.auth}`)
          .expect(404)
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });

    describe('SQL INJECTION :: ', () => {
      it('should give 404 error', (done) => {
        request(app)
          .delete(`${entityApiUrl}/;select * from 'users;`)
          .set('Authorization', `Bearer ${testConfig.auth}`)
          .expect(404)
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });

    describe('PROPER DATA :: ', () => {
      it('should return value (simple) ', (done) => {
        request(app)
          .delete(`${entityApiUrl}/${testStore.savedData[primaryKey]}`)
          .set('Authorization', `Bearer ${testConfig.auth}`)
          .expect(200)
          .then((response) => {
            if (response.error || response.body.message) {
              console.log('[RESPONSE: ERROR]', response.error);
              return done(response.error);
            }
            return request(app)
              .get(`${entityApiUrl}/${testStore.savedData[primaryKey]}`)
              .set('Authorization', `Bearer ${testConfig.auth}`)
              .expect(404);
          })
          .then((response) => {
            expect(response.body.body).toBeUndefined();
            done();
          })
          .catch((err) => {
            console.error(err);
            done(err);
          });
      });
    });
  });
});
