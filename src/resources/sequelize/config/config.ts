import config from '../../../config';

export = {
  development: {
    username: config.sqldb.user,
    database: config.sqldb.database,
    password: config.sqldb.password,
    host: config.sqldb.host,
    dialect: config.sqldb.dialect || (config.sqldb.options && config.sqldb.options.dialect) || 'mysql',
  },
};
