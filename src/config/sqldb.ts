export default {
  sqldb: {
    user: 'root',
    host: 'localhost',
    database: 'somedb',
    dialect: 'mysql',
    port: 3306,
    options: {
      dialect: 'mysql', // 'mysql'|'sqlite'|'postgres'|'mssql'
      logging: process.env.NO_SEQUELIZE_LOGS ? false : console.log, // or specify App.log level to use ('info', 'warn', 'verbose', etc)
    },
  },
};
