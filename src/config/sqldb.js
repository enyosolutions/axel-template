module.exports.sqldb = {
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
};
