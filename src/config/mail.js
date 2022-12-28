/* eslint-disable */


module.exports.mail = {
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



