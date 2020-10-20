/*
'use strict';
import { Sequelize,} from 'sequelize';
import tableModel from '../../../api/models/sequelize/Amibo';
export = {
  up: (queryInterface: any, Sequelize: Sequelize) => {

    //   Add altering commands here.
    //   Return a promise to correctly handle asynchronicity.

    //   Example:
    //   return queryInterface.createTable('users', { id: Sequelize.INTEGER });

      return queryInterface.createTable('monitoring_apps', tableModel.entity.attributes);
    },

    down: (queryInterface: any, Sequelize: Sequelize) => {
    //   Add reverting commands here.
    //   Return a promise to correctly handle asynchronicity.
    //   Example:
      return queryInterface.dropTable('monitoring_apps');

    }
  };
*/