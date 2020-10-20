import async from 'async';
import { axel, Axel } from '../axel';
const fs = require('fs');
const _ = require('lodash');
const colors = require('colors');
const Sequelize = require('sequelize');

async function loadSequelize() {
  if (axel.config.sqldb) {
    const datastore = axel.config.sqldb;
    axel.logger.debug('ORM ::', 'Connecting to database ', datastore.database);
    const sequelize = new Sequelize(datastore.database, datastore.user, datastore.password, {
      host: datastore.host,
      dialect: datastore.options.dialect,
      logging: datastore.options.logging,
      options: datastore.options,
      query: {
        raw: true,
      },
      pool: {
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 20000,
        handleDisconnects: true,
      },
      define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
      },
      operatorsAliases: false,
    });

    try {
      await sequelize.authenticate();
      axel.logger.warn(
        '✅ SQL DB Connection has been established successfully. %o',
        datastore.options,
      );
      return sequelize;
    } catch (err) {
      axel.logger.error('Unable to connect to the database:', err);
    }
  }
  return;
}
const sqlDB = loadSequelize();
export default sqlDB;
