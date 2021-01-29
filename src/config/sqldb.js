module.exports = {
  sqldb: {
    user: 'livodoc',
    host: 'localhost',
    database: 'livodoc',
    dialect: 'mysql',
    password: 'livodoc',
    port: 3306,
    options: {
      dialect: 'mysql', // 'mysql'|'sqlite'|'postgres'|'mssql'
      // eslint-disable-next-line
      logging: process.env.NO_SEQUELIZE_LOGS ? false : console.log, // or specify App.log level to use ('info', 'warn', 'verbose', etc)
    },
  },
};
