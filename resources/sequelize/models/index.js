/* eslint-disable */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { Sequelize } = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/config`)[env];
const db = {};
let sequelize;
sequelize = new Sequelize(config.database, config.username, config.password, config);
fs.readdirSync(path.resolve(`${__dirname}/../../../api/models/sequelize`))
  .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.resolve(`${__dirname}/../../../api/models/sequelize`, file));

    if (model.entity.attributes) {
      Object.entries(model.entity.attributes).forEach(([, attr]) => {
        if (typeof attr.type === 'string') {
          const type = attr.type.replace('DataTypes.', '').replace('sequelize.', '').replace(/\(.+\)/, '');
          const args = attr.type.match(/\(.+\)/);
          const resolvedType = _.get(Sequelize.DataTypes, type);
          if (resolvedType) {
            attr.type = resolvedType;
            if (args && args[0]) {
              attr.type = attr.type(...args[0].replace(/\(|\)/g, '').split(',').map(s => s.replace(/["']/g, '').trim()));
            }
          }
        }
      });
    }

    const SqlModel = sequelize.define(
      _.upperFirst(_.camelCase(model.identity)),
      model.entity.attributes,
      model.entity.options,
    );
    db[model.identity] = SqlModel;
    db[model.identity].associations = model.associations;
  });
Object.keys(db).forEach(identity => {
  if (db[identity].associations) {
    db[identity].associations(db);
  }
}),
  (db.Sequelize = Sequelize);
db.sequelize = sequelize;
module.exports = db;
