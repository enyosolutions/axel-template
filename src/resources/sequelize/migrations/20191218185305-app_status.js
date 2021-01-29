/*
'use strict';
const { Sequelize,} = require('sequelize');
const tableModel = require('../../../api/models/sequelize/Amibo');
export = {
  up: (queryInterface, Sequelize) => {

    //   Add altering commands here.
    //   Return a promise to correctly handle asynchronicity.

    //   Example:
    //   return queryInterface.createTable('users', { id: Sequelize.INTEGER });

      return queryInterface.createTable('monitoring_apps', tableModel.entity.attributes);
    },

    down: (queryInterface, Sequelize) => {
    //   Add reverting commands here.
    //   Return a promise to correctly handle asynchronicity.
    //   Example:
      return queryInterface.dropTable('monitoring_apps');

    }
  };
*/
