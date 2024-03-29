/* jshint indent: 1 */
const sequelize = require('sequelize');

const { DataTypes } = sequelize;

module.exports = {
  identity: 'user',
  entity: {
    attributes: {
      id: {
        type: 'DataTypes.INTEGER',
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      roles: {
        type: 'DataTypes.TEXT',
        allowNull: true,
        defaultValue: '',
        get() {
          const roles = this.getDataValue('roles');
          if (!roles) {
            return [];
          }

          try {
            return JSON.parse(roles);
          } catch (err) {
            console.warn('Error parsing roles', err);
            return roles;
          }
        },
        set(value) {
          this.setDataValue('roles', value ? JSON.stringify(value) : '');
        },
      },
      firstName: {
        type: 'DataTypes.STRING(100)',
        allowNull: false,
      },
      lastName: {
        type: 'DataTypes.STRING(100)',
        allowNull: false,
      },
      email: {
        type: 'DataTypes.STRING(100)',
        allowNull: false,
      },
      phonenumber: {
        type: 'DataTypes.STRING(50)',
        allowNull: true,
      },
      encryptedPassword: {
        type: 'DataTypes.STRING(100)',
        allowNull: false,
        defaultValue: '',
      },
      googleId: {
        type: 'DataTypes.STRING(50)',
        allowNull: true,
      },
      googleToken: {
        type: 'DataTypes.STRING(500)',
        allowNull: true,
      },
      facebookId: {
        type: 'DataTypes.STRING(50)',
        allowNull: true,
      },
      facebookToken: {
        type: 'DataTypes.STRING(500)',
        allowNull: true,
      },
      isActive: {
        type: 'DataTypes.BOOLEAN',
        allowNull: true,
        defaultValue: true,
      },
      hasConfirmedEmail: {
        type: 'DataTypes.BOOLEAN',
        allowNull: true,
        defaultValue: false,
      },
      passwordResetToken: {
        type: 'DataTypes.STRING(200)',
        allowNull: true,
      },
      passwordResetRequestedOn: {
        type: 'DataTypes.DATE',
        allowNull: true,
      },
      activationToken: {
        type: 'DataTypes.STRING(200)',
        allowNull: true,
      },

      lastConnexionOn: {
        type: 'DataTypes.DATE',
        allowNull: true,
      },
    },
    associations: (models) => { // eslint-disable-line
      //  models.user.hasMany(models.notification, { foreignKey: 'userId' });
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
