/* eslint-disable */

import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { Sequelize } from 'sequelize';
// import localConfig from '../../../config';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const config = require(`${__dirname}/../config/config`)[env];

// config.database = localConfig.sqldb.database;
// config.username = localConfig.sqldb.user;
// config.password = localConfig.sqldb.password;
// config.host = localConfig.sqldb.host;
// config.define = {
//   charset: 'utf8',
//   collate: 'utf8_general_ci',
// };

const db : {sequelize?: Sequelize,
 [key: string]: any} = {};

let sequelize: Sequelize    ;
sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
fs.readdirSync(path.resolve(`${__dirname}/../../../api/models/sequelize`))
  .filter(
    (file: string) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.js' || file.slice(-3) === '.ts')
  )
  .forEach((file: string) => {
    const model = require(path.resolve(
      `${__dirname}/../../../api/models/sequelize`,
      file
    ));
    // Object.keys(model.entity.attributes).forEach(k =>
    //   console.log(model.tableName, k, model.entity.attributes[k].field)
    // );

    const SqlModel = sequelize.define(
      _.upperFirst(_.camelCase(model.identity)),
      model.entity.attributes,
      model.entity.options
    );
    db[model.identity] = SqlModel;
    db[model.identity].associations = model.associations;
  });

Object.keys(db).forEach((identity: string) => {
  if (db[identity].associations) {
    db[identity].associations(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

export default db;
