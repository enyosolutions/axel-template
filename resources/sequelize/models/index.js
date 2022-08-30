require('dotenv').config();
const { Sequelize } = require('sequelize');
const { loadSqlModels } = require('axel-core/src/models');

module.exports = loadSqlModels({ loadHooks: false }).then(axel => ({
  sequelize: axel.sqldb,
  Sequelize,
}));
