/* eslint-disable */


module.exports = {
  port: process.env.PORT || 1337,
  node_env: process.env.NODE_ENV || 'development',
  env: 'LOCAL',
  app: 'app_local',
  color: '#50867c',
  websiteUrl: process.env.FRONTEND_URL || 'http://localhost:80',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:80',
  apiUrl: process.env.API_URL || 'http://localhost:1337',
  cdnUrl: process.env.CDN_URL || 'http://localhost:1337',
  tokenSecret: process.env.APP_SECRET || '',
  disableCron: process.env.ENABLE_CRON !== undefined ? process.env.ENABLE_CRON : false,
};



