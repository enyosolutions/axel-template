/* eslint-disable */


module.exports = {
  port: process.env.PORT || 1337,
  node_env: process.env.NODE_ENV || 'development',
  env: 'LOCAL',
  app: 'app_local',
  color: '#50867c',
  tokenSecret: process.env.APP_SECRET || '',
  disableCron: process.env.ENABLE_CRON !== undefined ? process.env.ENABLE_CRON : false,
  sqldb: {
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'localhost',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'app_database_env',
    port: process.env.DATABASE_PORT || 3306,
    dialect: process.env.DATABASE_DIALECT || 'mysql',
    options: {
      dialect: process.env.DATABASE_DIALECT || 'mysql',
      logging: false, // use DEBUG=sequelize:*  to see sql logs
    }
  },

  mail: {
    transport: 'smtp', // aws | gmail | sendgrid | smtp
    protocol: 'SMTP',
    options: {
      host: '127.0.0.1',
      port: 25,
      tls: {
        rejectUnauthorized: false
      }
    },
    from: 'hello@applocal.com'
  },
};



