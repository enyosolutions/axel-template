/**
 * axel-entity-config
 *
 * @description :: This is model file that connects with sequelize.
 *                 TODO: You might write a short summary of
 *                 how this model works and what it represents here.
 */

const Sequelize = require('sequelize');
import {
  jsonStringifyHook,
  bulkJsonStringifyHook,
  jsonParseHook,
  bulkJsonParseHook,
} from '../../../common/services/SequelizeHooks';


const AxelModelFieldConfig = {
  identity: 'axelModelFieldConfig',
  entity: {
    attributes: {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      parentIdentity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING,
      },

      type: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.STRING,
      },
      relation: {
        type: Sequelize.STRING,
      },
      foreignKey: {
        type: Sequelize.STRING,
      },
      column: {
        type: Sequelize.TEXT,
        defaultValue: {},
      },
      field: {
        type: Sequelize.TEXT,
        defaultValue: {},
      },
    },
    options: {
      // disable the modification of tablenames; By default, sequelize will automatically
      // transform all passed model names (first parameter of define) into plural.
      // if you don't want that, set the following
      freezeTableName: true,
      // Table Name
      tableName: 'axel-model-field-config',
      // Enable TimeStamp
      timestamps: true,
      // createdAt should be createdOn
      createdAt: 'createdOn',
      // updatedAt should be lastModifiedOn
      updatedAt: 'lastModifiedOn',
      // Hooks. see => http://docs.sequelizejs.com/manual/tutorial/hooks.html
      hooks: {
        afterSave: jsonParseHook(['type', 'column', 'field'], {}),
        beforeValidate: jsonStringifyHook(['type', 'column', 'field'], {}),
        afterFind: bulkJsonParseHook(['type', 'column', 'field'], {}),
        beforeBulkCreate: bulkJsonStringifyHook(['type', 'column', 'field'], {}),
        beforeBulkUpdate: bulkJsonStringifyHook(['type', 'column', 'field'], {}),
      },
      indexes: [
        {
          unique: true,
          fields: ['parentIdentity', 'name'],
        },
        {
          unique: false,
          fields: ['parentIdentity'],
        },
        {
          unique: false,
          fields: ['name'],
        },
      ],
    },
    // Create relations
    associations: (models: Obj): void => {
      console.log(Object.keys(models));
      models.axelModelFieldConfig.belongsTo(models.axelModelConfig, {
        targetKey: 'identity',
        foreignKey: 'parentIdentity',
      });
    },
    // define default join
    // @ts-ignore
    defaultScope: (models: Obj): void => ({}),
  },
};

module.exports = AxelModelFieldConfig;
