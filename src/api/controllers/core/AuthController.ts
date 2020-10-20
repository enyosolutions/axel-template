/**
 * AuthController
 *
 * @module      :: Controller
 * @description    :: Provides the base authentication
 *                 actions used to make waterlock work.
 *m
 * @docs        :: http://waterlock.ninja/documentation
 */

const bcrypt = require('bcrypt');
import _ from 'lodash';
import { Request, Response, NextFunction } from 'express';
import Utils from '../../../common/services/Utils';
import { ExtendedError } from '../../../axel';
import MailService from '../../../common/services/MailService';
import AuthService from '../../../common/services/AuthService';
import GoogleAuthService from '../../services/GoogleAuthService';
import FacebookAuthService from '../../services/FacebookAuthService';

declare const axel: any;

const primaryKey = axel.config.framework.primaryKey;
// const flatten = require('flat');
// const unfflatten = require('flat').unfflatten;

module.exports = {
  /**
   * @description get the data for the current user
   * @return {User}
   * @swagger
   * /auth/user:
   *   get:
   *     description: Get the current logger user
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  get(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({
        message: 'error_no_token',
        errors: ['error_no_token'],
      });
      return;
    }

    axel.models.user.em
      .findByPk(req.user[primaryKey], {
        include: [
          { model: axel.models.client.em, as: 'Client', required: false },
          { model: axel.models.provider.em, as: 'Provider', required: false },
        ],
        raw: false,
      })
      .then((user: any) => {
        if (user) {
          user = user.get();

          if (!user.roles || typeof user.roles === 'string') {
            user.roles = ['USER'];
          }
          user.visits += 1;
          axel.models.user.em.update(user, {
            where: {
              id: user.id,
            },
          });

          return res.status(200).json({
            user,
          });
        }
        return res.status(404).json({
          message: 'no_user_found',
          errors: ['no_user_found'],
        });
      })
      .catch((err: Error) => {
        axel.logger.warn(err);
        Utils.errorCallback(err, res);
      });
  },

  /**
   * @description confirm the registration of the user
   * @return {User}
   * @swagger
   * /auth/confirm:
   *   get:
   *     description: Confirm the registration of user
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  confirmUserRegistration(req: Request, res: Response) {
    const email = req.param('email');
    const token = req.param('token');

    if (!email) {
      return res.status(404).json({
        errors: ['missing_email'],
        message: 'missing_email',
      });
    }

    if (!token) {
      return res.status(404).json({
        errors: ['missing_activation_token'],
        message: 'missing_activation_token',
      });
    }

    axel.models.user.em
      .findOne({
        where: { email },
      })
      .then((u: any) => {
        if (!u) {
          throw new ExtendedError({
            code: 400,
            errors: ['error_unknown_email'],
            message: 'error_unknown_email',
          });
        }

        if (token !== u.activationToken) {
          throw new ExtendedError({
            code: 404,
            errors: ['wrong_activation_token'],
            message: 'wrong_activation_token',
          });
        }

        return axel.models.user.em.update(
          {
            isActive: true,
            activationToken: null,
          },
          {
            where: {
              email,
            },
          },
        );
      })
      .then(() => res.redirect(`${axel.config.websiteUrl}/login`))
      .catch((err: Error) => {
        axel.logger.warn(err);
        Utils.errorCallback(err, res);
      });
  },

  /**
   * [description]
   * @param  {[type]}
   * @param  {[type]}
   * @return {[type]}
   *
   * @swagger
   *
   * /auth/forgot:
   *   get:
   *     description: sends a new password reset email
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: Email/username to use for login.
   *         required: false
   *         in: formData
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  forgot(req: Request, res: Response) {
    const email = req.body.email || req.query.email;
    let user: any;
    if (!email) {
      throw new ExtendedError({
        code: 401,
        errors: ['error_email_required'],
        message: 'error_email_required',
      });
    }

    axel.models.user.em
      .findOne({
        where: { email },
      })
      .then((u: any) => {
        user = u;
        if (!user) {
          throw new ExtendedError({
            code: 400,
            errors: ['error_unknown_email'],
            message: 'error_unknown_email',
          });
        }

        let hash = bcrypt.hashSync(`${Date.now()} ${user.id}`, bcrypt.genSaltSync());
        hash = hash.replace(/\//g, '');
        hash = hash.replace(/\./g, '-');
        user.passwordResetToken = hash;

        user.passwordResetRequestedAt = new Date();
        return axel.models.user.em.update(
          {
            passwordResetToken: hash,
            passwordResetRequestedAt: user.passwordResetRequestedAt,
          },
          {
            where: {
              email,
            },
          },
        );
      })
      .then((success: any) => {
        if (!success) {
          return res.status(403).json({
            errors: ['error_forbidden'],
            message: 'error_forbidden',
          });
        }
        MailService.sendPasswordReset(user.email, {
          user,
        });
        return res.status(200).json({});
      })
      .catch((err: Error) => {
        axel.logger.warn(err);
        Utils.errorCallback(err, res);
      });
  },

  /**
   * @swagger
   *
   * /auth/login:
   *   post:
   *     description: Login to the application
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: Email/username to use for login.
   *         required: false
   *         in: body
   *         type: string
   *       - name: password
   *         description: User's password.
   *         in: body
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: user object and login token
   *         schema:
   *           type: object
   *           properties:
   *             token:
   *               type: string
   *               description: The jwt token for subsequent requests
   *             user:
   *               type: 'object'
   *               $ref: '#/definitions/User'
   */
  login(req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;
    let token: string;
    const isAdminLogin = req.path.indexOf('admin_login') > -1;
    let user: any;
    if (!email || !password) {
      return res.status(401).json({
        errors: ['error_missing_credentials'],
        message: 'error_missing_credentials',
      });
    }

    axel.models.user.em
      .findOne({
        where: {
          email,
        },
      })
      .then((u: any) => {
        user = u;
        if (!u) {
          throw new Error('error_unknown_email');
        }

        return AuthService.comparePassword(password, user);
      })
      .then((valid: boolean) => {
        if (!valid) {
          throw new Error('error_invalid_credentials');
        }

        if (!user.isActive || user.deactivated) {
          throw new Error('error_deactivated_user');
        }

        if (!user.roles) {
          user.roles = ['USER'];
        }

        if (typeof user.roles === 'string') {
          try {
            user.roles = JSON.parse(user.roles);
          } catch (e) {
            user.roles = ['USER'];
          }
        }

        token = AuthService.generateFor(user);
        if (!user.logins) {
          user.visits = 0;
          user.logins = 0;
        }

        user.logins += 1;
        user.visits += 1;
        user.lastConnexionOn = new Date();

        const updatedUser = _.cloneDeep(user);

        return axel.models.user.em.update(updatedUser, {
          where: {
            id: updatedUser.id,
          },
        });
      })
      // eslint-disable-next-line no-undef
      .then((valid: boolean) => {
        if (!valid) {
          throw new Error('error_deactivated_user');
        }
      })
      .then(() =>
        res.status(200).json({
          user,
          token,
        }),
      )
      .catch((errUpdate: ExtendedError) => {
        if (errUpdate.message) {
          return res.status(401).json({
            errors: [errUpdate.message],
            message: errUpdate.message,
          });
        }

        axel.logger.warn(errUpdate);

        Utils.errorCallback(errUpdate, res);
      });
  },

  async googleCallback(req: Request, res: Response) {
    const googleToken: any = req.query.token;
    let email = '';
    let token: string;
    let newUserModel: any;
    let user: any;
    let newUserCreated = false;

    GoogleAuthService.getGoogleAccountFromToken(googleToken)
      .then((account: any) => {
        if (!account) {
          throw new Error('error_wrong_google_token');
        }

        email = account.email;

        newUserModel = {
          email: email.toLowerCase(),
          googleId: account.googleId,
          firstName: account.firstName,
          lastName: account.lastName,
          roles: JSON.stringify(['USER']),
          active: true,
        };

        return axel.models.user.em.findOne({
          where: {
            email,
          },
        });
      })
      .then((user: any) => {
        if (!user) {
          newUserCreated = true;

          return axel.models.user.em.create(newUserModel, {
            raw: true,
          });
        }
      })
      .then(() =>
        axel.models.user.em.findOne({
          where: {
            email,
          },
        }),
      )
      .then((dbUser: any) => {
        if (dbUser) {
          user = dbUser;

          if (user.roles && typeof user.roles === 'string') {
            try {
              user.roles = JSON.parse(user.roles);
            } catch (e) {
              axel.logger.warn(e);
            }
          }

          // If user created successfuly we return user and token as response
          token = AuthService.generateFor(user);

          if (!user.logins) {
            user.visits = 0;
            user.logins = 0;
          }

          user.logins += 1;
          user.visits += 1;
          user.lastConnexionOn = new Date();

          return axel.models.user.em.update(user, {
            where: {
              [primaryKey]: user[primaryKey],
            },
          });
        }

        throw new Error('user_not_created');
      })
      // eslint-disable-next-line no-undef
      .then(() => {
        res.status(200).json({
          user,
          token,
        });
      })
      .catch((err: ExtendedError) => {
        axel.logger.warn(err && err.message ? err.message : err);
        Utils.errorCallback(err, res);
      });
  },

  async facebookCallback(req: Request, res: Response, next: NextFunction) {
    let facebookAccount: any;
    let facebookToken: any = req.query.token;
    let email = '';
    let token: string;
    let newUserModel: any;
    let user: any;
    let newUserCreated = false;

    FacebookAuthService.getFacebookAccountDetails(facebookToken)
      .then(account => {
        facebookAccount = account;

        email = facebookAccount.email;

        if (!email) {
          email = `${facebookAccount.id}@facebook.com`;
        }

        const facebookId = facebookAccount.facebookId;

        if (!facebookId || !email) {
          throw new Error('error_missing_fb_profile_data');
        }

        newUserModel = {
          email: email.toLowerCase(),
          facebookId,
          firstName: facebookAccount.firstName,
          lastName: facebookAccount.lastName,
          roles: JSON.stringify(['USER']),
          active: true,
        };

        return axel.models.user.em.findOne({
          where: {
            email,
          },
        });
      })

      .then((user: any) => {
        if (!user) {
          newUserCreated = true;

          return axel.models.user.em.create(newUserModel, {
            raw: true,
          });
        }
      })
      .then(() =>
        axel.models.user.em.findOne({
          where: {
            email,
          },
        }),
      )
      .then((dbUser: any) => {
        if (dbUser) {
          user = dbUser;

          if (user.roles && typeof user.roles === 'string') {
            try {
              user.roles = JSON.parse(user.roles);
            } catch (e) {
              axel.logger.warn(e);
            }
          }

          // If user created successfuly we return user and token as response
          token = AuthService.generateFor(user);

          if (user.activationToken) {
            delete user.activationToken;
          }

          if (!user.logins) {
            user.visits = 0;
            user.logins = 0;
          }

          user.logins += 1;
          user.visits += 1;
          user.lastConnexionOn = new Date();

          return axel.models.user.em.update(user, {
            where: {
              [primaryKey]: user[primaryKey],
            },
          });
        }

        throw new Error('user_not_created');
      })
      // eslint-disable-next-line no-undef
      .then(() => {
        res.status(200).json({
          user,
          token,
        });
      })
      .catch((err: ExtendedError) => {
        axel.logger.warn(err && err.message ? err.message : err);
        Utils.errorCallback(err, res);
      });
  },
};
