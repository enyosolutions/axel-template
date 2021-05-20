const config = require('../../../src/config/local');

module.exports = {
  development: {
    username: config.sqldb.user,
    database: config.sqldb.database,
    password: config.sqldb.password,
    host: config.sqldb.host,
    dialect: config.sqldb.dialect || (config.sqldb.options && config.sqldb.options.dialect) || 'mysql',
  },
  define: {
    charset: 'utf8',
    collate: 'utf8mb4_unicode_ci',
  }
};
