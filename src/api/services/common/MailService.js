const _ = require('lodash');
const { MailService } = require('axel-core');


const logEmailError = (err) => {
  axel.logger.warn(err);
  throw err;
};

class myMailService extends MailService {
  constructor(nodemailer) {
    super(nodemailer);
    this.defaultData = {
      ...super.defaultData,
      title: '',
      layout: 'email-template',
    };
  }

  sendPasswordReset(email, data = {}) {
    const mergedData = _.merge({}, this.defaultData, data);
    mergedData.title = 'Mot de passe perdu';
    return axel.renderView('emails/password-reset', mergedData)
      .then(html => this.sendMail(email, mergedData.title, html))
      .catch(logEmailError);
  }

  sendUserCreated(user) {
    const data = _.merge({}, this.defaultData);
    data.title = 'Bienvenue';
    data.user = user;

    return axel.renderView('emails/account-created', data).then(html => this.sendMail(
      user.email,
      data.title,
      html
    ))
      .catch(logEmailError);
  }

  async sendEmailConfirmation(user) {
    const data = _.merge({}, this.defaultData);
    data.title = `${axel.config.appName || axel.config.app} - Confirmez votre adresse`;
    data.user = user;

    return axel.renderView('emails/account-created', data).then(html => this.sendMail(
      user.email,
      data.title,
      html
    ))
      .catch(logEmailError);
  }

  /*
  // Uncomment this to override mailer function
  sendMail(email, subject, body, options = {}) {
    if (process.env.AXEL_DISABLE_EMAILS) {
      axel.logger.log('AXEL_DISABLE_EMAILS: disabled. Email [%s] not sent', subject);
      return Promise.resolve('emails_are_disabled');
    }

    const transporter = this.getTransport();
    let mailOptions = {
      to: email,
      from: axel.config.mail.from,
      subject,
      html: body,
      status: '',
    };

    mailOptions = _.merge(mailOptions, options);

    return new Promise((resolve, reject) => {
      try {
        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.warn('[sendMail][err] => ', err);
            // axel.logger.warn('error while sending Email');
            axel.logger.warn('error while sending Email', err);
            axel.logger.warn('***');
            axel.logger.warn('***');
            axel.logger.warn('***');
            mailOptions.status = 'notsent';
            reject(err);
            return;
          }
          debug('** ');
          debug('** Email sent');
          debug('** ');
          mailOptions.status = 'sent';
          resolve(true);
          return true;
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  */
}

const mailer = myMailService();
module.exports = mailer;
module.exports.MailService = mailer;
axel.services.mailService = mailer;
