/* jshint indent: 1 */
// tslint:disable
import * as sequelize from 'sequelize';
import {DataTypes} from 'sequelize';


module.exports = {
  identity: 'user',
  entity: {
    attributes: {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      encryptedPassword: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      settings: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      preferredLanguage: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'pt',
      },
      phonenumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      passwordResetToken: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      passwordResetRequestedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      activationToken: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      googleId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      googleToken: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      facebookId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      facebookToken: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      accountType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 1,
      },
      hasCompletedRegistration: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      lastConnexionOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    associations: (models: { [key: string]: any }) => {
      models.user.hasOne(models.client, {
        foreignKey: 'id',
        targetKey: 'userId',
      });
      models.user.hasOne(models.provider, {
        foreignKey: 'id',
        targetKey: 'userId',
      });
    },
    options: {
      tableName: 'user',
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdOn',
      updatedAt: 'lastModifiedOn',
    },
  },
};
