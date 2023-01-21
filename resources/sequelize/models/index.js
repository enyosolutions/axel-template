require('dotenv').config();
const { Sequelize } = require('sequelize');
const { loadSqlModels } = require('axel-core/src/models');

module.exports = loadSqlModels({ loadHooks: false }).then(axel => ({
  models: Object.values(axel.models).reduce((acc, current) => {
    acc[current.identity] = current.em;
    return acc;
  }, {}),
  sequelize: axel.sqldb,
  Sequelize,
}));
