/**
 * axel-entity-config
 *
 * @description :: This is model file that connects with sequelize.
 *                 TODO: You might write a short summary of
 *                 how this model works and what it represents here.
 */

import { DataTypes } from 'sequelize';
import {
  jsonStringifyHook,
  bulkJsonStringifyHook,
  jsonParseHook,
  bulkJsonParseHook,
} from '../../../common/services/SequelizeHooks';
/*
  // event hooks => http://docs.sequelizejs.com/manual/tutorial/hooks.html
  const eventCallback = () => { // items, options
    // do something like stringifying data...
  };
*/

const jsonFields = ['options', 'layout', 'formOptions', 'kanbanOptions', 'listOptions'];
const AxelModelConfig = {
  identity: 'axelModelConfig',
  entity: {
    attributes: {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      identity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      namePlural: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pageTitle: {
        type: DataTypes.STRING,
      },
      icon: {
        type: DataTypes.STRING,
      },
      options: {
        type: DataTypes.TEXT,
      },
      actions: {
        type: DataTypes.TEXT,
      },
      formOptions: {
        type: DataTypes.TEXT,
      },
      kanbanOptions: {
        type: DataTypes.TEXT,
      },
      listOptions: {
        type: DataTypes.TEXT,
      },
    },
    options: {
      // disable the modification of tablenames; By default, sequelize will automatically
      // transform all passed model names (first parameter of define) into plural.
      // if you don't want that, set the following
      freezeTableName: true,
      // Table Name
      tableName: 'axel-entity-config',
      // Enable TimeStamp
      timestamps: true,
      // createdAt should be createdOn
      createdAt: 'createdOn',
      // updatedAt should be lastModifiedOn
      updatedAt: 'lastModifiedOn',
      // Hooks. see => http://docs.sequelizejs.com/manual/tutorial/hooks.html
      hooks: {
        // beforeSave: jsonStringifyHook(['options', 'layout', 'actions'], {}),
        afterSave: jsonParseHook(jsonFields, {}),
        beforeValidate: jsonStringifyHook(jsonFields, {}),
        afterFind: bulkJsonParseHook(jsonFields, {}),
        beforeBulkCreate: bulkJsonStringifyHook(jsonFields, {}),
        beforeBulkUpdate: bulkJsonStringifyHook(jsonFields, {}),
      },
      indexes: [
        // {
        //  unique: false,
        //  fields: ['userId'],
        // },
        {
          unique: true,
          fields: ['identity'],
        },
      ],
    },
    // Create relations
    // @ts-ignore
    associations: models => {
      models.axelModelConfig.hasMany(models.axelModelFieldConfig, {
        foreignKey: 'parentIdentity',
        sourceKey: 'identity',
      });
    },
    // define default join
    // @ts-ignore
    defaultScope: models => ({}),
  },
};

module.exports = AxelModelConfig;
