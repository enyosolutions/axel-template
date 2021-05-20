const request = require('supertest');
const faker = require('faker');
const jsf = require('json-schema-faker');
const model = require('../../src/api/models/schema/user');
const controller = require('../../src/api/controllers/core/UserController');

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

  // POST
  describe('#METHODS() :: ', () => {
    describe('WITHOUT TOKEN :: ', () => {
      it('should have a POST method', () => {
        expect(controller.create).toBeDefined();
        expect(controller.get).toBeDefined();
        expect(controller.list).toBeDefined();
        expect(controller.delete).toBeDefined();
        expect(controller.exists).toBeDefined();
      });
    });
  });
});
