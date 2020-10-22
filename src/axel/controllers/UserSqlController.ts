/**
 * UserSqlController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.axel.s.org/docs/controllers
 */

 import { Request, Response } from 'express';
 import moment from 'moment';
 import _ from 'lodash';
 import Utils from '../services/Utils';
 import { ExtendedError } from '../index';
 import AuthService from '../services/AuthService';
 import MailService from '../services/MailService';

 declare const axel: any;

 const primaryKey: string =
 axel.models['user'] && axel.models['user'].em && axel.models['user'].em.primaryKeyField
 ? axel.models['user'].em.primaryKeyField
 : axel.config.framework.primaryKey;

 module.exports = {
  initDefaultUser(req: Request, res: Response) {
    if (['PROD', 'prod', 'production'].indexOf(axel.config.env) > -1) {
      res.json('NOPE');
      return;
    }
    req.body = {};
    req.body.email = 'dev@enyosolutions.com';
    req.body.firstname = 'Tony';
    req.body.lastname = 'Stark';
    req.body.username = 'enyosolutions';
    req.body.password = 'Test1234';
    req.body.roles = ['USER', 'ADMIN', 'DEVELOPER'];
    axel.getActions()['user/create'](req, res);
  },

  /**
   * @swagger
   *
   * /user:
   *   post:
   *     description: Create a user (registration)
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user
   *         description: User object
   *         in:  body
   *         required: true
   *         type: string
   *         schema:
   *           $ref: '#/definitions/User'
   *     responses:
   *       200:
   *         description: users
   *         schema:
   *           $ref: '#/definitions/User_ItemResponse'
   */
   create(req: Request, res: Response) {
    let token: string;
    if (!req.body.email) {
      return res.status(400).json({
        errors: ['error_missing_email'],
        message: 'error_missing_email',
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        errors: ['error_missing_password'],
        message: 'error_missing_password',
      });
    }

    if (!req.body.username) {
      if (axel.config.framework.user.username) {
        return res.status(400).json({
          errors: ['error_missing_username'],
          message: 'error_missing_username',
        });
      }
      req.body.username = req.body.email;
    }

    let newUser = req.body;
    newUser.email = newUser.email.toLowerCase();
    newUser.username = newUser.username.toLowerCase();

    axel.models.user.em
    .findOne({
      where: {
        email: newUser.email,
      },
    })
    .then((user: any) => {
      if (user) {
        throw new ExtendedError({
          code: 400,
          stack: 'error_conflict_email',
          message: 'error_conflict_email',
          errors: ['error_conflict_email'],
        });
      }

      if (!newUser.roles) {
        newUser.roles = JSON.stringify(['USER']);
      }
      newUser.isActive =
      !axel.config.framework.emailConfirmationRequired &&
      !axel.config.framework.accountManualVerification;

      return AuthService.beforeCreate(newUser);
    })
    .then((data: any) => {
      if (data) {
        return axel.models.user.em.create(newUser, {
          raw: true,
        });
      }
      throw new Error('password_encoding_error');
    })
    .then((result: any) => {
      if (result && result.dataValues) {
        newUser = result.dataValues;

        if (newUser.roles && typeof newUser.roles === 'string') {
          try {
            newUser.roles = JSON.parse(newUser.roles);
          } catch (e) {
            axel.logger.warn(e);
          }
        }

        // If user created successfuly we return user and token as response
        token = AuthService.generateFor(newUser);

        if (axel.config.framework.user.emailConfirmationRequired) {
          newUser.activationToken = Utils.md5(`${Date.now() + Math.random() * 1000}`);
          newUser.isActive = false;
        } else {
          newUser.isActive = true;
        }

        if (newUser.activationToken) {
          delete newUser.activationToken;
        }

        return axel.models.user.em.update(newUser, {
          where: {
            [primaryKey]: newUser[primaryKey],
          },
        });
      }
      throw new Error('user_not_created');
    })
    .then(() => {
      if (
        newUser &&
        newUser[primaryKey] &&
        axel.config.framework.user.emailConfirmationRequired
        ) {
        return MailService.sendEmailConfirmation(
          Object.assign(
          {
            activationToken: Utils.md5(`${Date.now() + Math.random() * 1000}`),
          },
          newUser,
          ),
          );
    }
    return true;
  })
    // eslint-disable-next-line no-undef
    .then(() => {
      if (newUser[primaryKey]) {
        res.status(200).json({
          user: newUser,
          token,
        });
      } else {
        res.status(503).json({
          errors: ['user_not_saved'],
          message: 'user_not_saved',
        });
      }
    })
    .catch((err: ExtendedError) => {
      axel.logger.warn(err && err.message ? err.message : err);
      Utils.errorCallback(err, res);
    });
  },

  /**
   *
   */
   getByResetToken(req: Request, res: Response) {
    const resetToken = req.param('resetToken');

    if (!resetToken) {
      return res.status(404).json({
        errors: ['missing_argument'],
        message: 'missing_argument',
      });
    }

    axel.models.user.em
    .findOne({
      where: {
        resetToken,
      },
    })
    .then((data: any) => {
      if (!data) {
        throw new ExtendedError({
          code: 401,
          stack: 'invalid_token',
          message: 'invalid_token',
          errors: ['invalid_token'],
        });
      }
      if (
        !data.passwordResetRequestedOn ||
        moment(data.passwordResetRequestedOn)
        .add(10, 'm')
        .isBefore(new Date())
        ) {
        throw new ExtendedError({
          code: 401,
          stack: 'expired_token',
          message: 'The password reset request has expired, please try again.',
          errors: ['expired_token'],
        });
    }
    res.json({
      resetToken: data.resetToken,
      [primaryKey]: data[primaryKey],
    });
  })
    .catch((err: ExtendedError) => {
      res.status(err.code ? parseInt(err.code) : 400).json({
        errors: [err.message || 'global_error'],
        message: err.message || 'global_error',
      });
    });
  },

  reset(req: Request, res: Response) {
    const resetToken = req.param('resetToken');

    if (!resetToken) {
      return res.status(404).json({
        errors: ['missing_argument'],
        message: 'missing_argument',
      });
    }

    if (!req.body.password) {
      return res.status(404).json({
        errors: ['error_missing_password'],
        message: 'error_missing_password',
      });
    }

    let user: any;
    axel.models.user.em
    .findOne({
      where: {
        resetToken,
      },
    })
    .then((u: any) => {
      if (!u || u.length < 1) {
        throw new ExtendedError({
          code: 401,
          message: 'invalid_token',
          errors: ['invalid_token'],
        });
      }
      user = u;
      if (
        !user.passwordResetRequestedOn ||
        moment(user.passwordResetRequestedOn)
        .add(20, 'm')
        .isBefore(new Date())
        ) {
        throw new ExtendedError({
          code: 401,
          message: 'The password reset request has expired, please try again.',
          errors: ['expired_token'],
        });
    }
    user.password = req.body.password;
    return AuthService.beforeUpdate(user);
  })
    .catch((err: ExtendedError) => {
      res.status(err.code ? parseInt(err.code) : 400).json({
        errors: [err.message || 'not_found'],
        message: err.message || 'not_found',
      });
    })
    .then((result: any) => {
      if (result) {
        user.resetToken = '';
        return axel.models.user.em.update(user, {
          where: {
            [primaryKey]: user[primaryKey],
          },
        });
      }
    })
    .catch((err: ExtendedError) => {
      res.status(err.code ? parseInt(err.code) : 400).json({
        errors: [err.message || 'update_error'],
        message: err.message || 'update_error',
      });
    })
    .then((success: any) => {
      if (success) {
        res.status(200).json({
          body: 'password_reset_success',
        });
      }
    })
    .catch((err: ExtendedError) => {
      res.status(400).json({
        message: 'global_error',
        errors: [err.message],
      });
    });
  },

  list(req: Request, resp: Response) {
    const { listOfValues, startPage, limit } = Utils.injectPaginationQuery(req);

    const options = {
      limit,
      skip: startPage * limit,
    };

    let query: any = Utils.injectQueryParams(req);

    if (req.query.search) {
      query = Utils.injectSqlSearchParams(req, query, {
        modelName: 'user',
      });
    }
    if (req.query.roles) {
      query.roles = {
        [axel.sqldb.Op.like]: axel.sqldb.literal(`'%"${req.query.roles}"%'`),
      };
    }
    query = Utils.cleanSqlQuery(query);

    axel.models.user.em
    .findAndCountAll({ where: query }, options)
    .then((result: { count: number; rows: [] }) => {
      let data;
      if (result && Array.isArray(result.rows)) {
        data = result.rows.map((user: any) => {
          delete user.encryptedPassword;
          if (user.roles && typeof user.roles === 'string') {
            try {
              user.roles = JSON.parse(user.roles);
            } catch (e) {
              axel.logger.warn(e);
            }
          }
          return user;
        });

        if (listOfValues) {
          data = data.map(item => ({
            [primaryKey]: item[primaryKey].toString(),
            label: Utils.formatName(item.firstname, item.lastname, item.username, true),
          }));
        }
        return resp.status(200).json({
          body: data,
          page: startPage,
          count: limit,
          totalCount: result.count,
        });
      }
      return resp.status(200).json({
        body: [],
      });
    })
    .catch((err: ExtendedError) => {
      resp.status(500).json({
        errors: [err.message],
        message: err.message,
      });
    });
  },

  get(req: Request, resp: Response) {
    const id = req.param('userId');
    const listOfValues = req.query.listOfValues ? req.query.listOfValues : false;
    axel.models.user.em
    .findByPk({
      [primaryKey]: id,
    })
    .then((doc?: any) => {
      if (!doc) {
        return resp.status(404).json({
          message: 'not_found',
          errors: ['not_found'],
        });
      }

      if (doc.roles && typeof doc.roles === 'string') {
        try {
          doc.roles = JSON.parse(doc.roles);
        } catch (e) {
          axel.logger.warn(e);
        }
      }

      if (listOfValues) {
        return resp.status(200).json({
          body: {
            [primaryKey]: doc[primaryKey].toString(),
            label: Utils.formatName(doc.firstname, doc.lastname, doc.username, true),
          },
        });
      }

      delete doc.password;
      delete doc.encryptedPassword;
      return resp.status(200).json({
        body: doc,
      });
    })
    .catch((err: ExtendedError) => {
      resp.status(500).json({
        errors: [err],
        message: err.message,
      });
    });
  },

  exists(req: Request, resp: Response) {
    const username = req.query.username;
    const email = req.query.email;
    if (!username && !email) {
      return resp.status(400).json({
        errors: ['missing_argument'],
        message: 'missing_argument',
      });
    }
    axel.models.user.em
    .findOne(username ? { where: { username: `${username}` } } : { where: { email: `${email}` } })
    .then((doc?: any) => {
      if (doc) {
        return resp.status(200).json({
          body: true,
        });
      }
      return resp.status(200).json({
        body: false,
      });
    })
    .catch((err: ExtendedError) => {
      Utils.errorCallback(err, resp);
    });
  },

  update(req: Request, res: Response) {
    let user;
    const newUser = req.body;
    let data: any;
    const id = req.param('userId');
    if (req.body.email === null) {
      if (axel.config.framework.user.email) {
        return res.status(404).json({
          errors: ['error_missing_email'],
          message: 'error_missing_email',
        });
      }
    }

    if (req.body.username === null) {
      if (axel.config.framework.user.username) {
        return res.status(404).json({
          errors: ['error_missing_username'],
          message: 'error_missing_username',
        });
      }
      req.body.username = req.body.email;
    }

    axel.models.user.em
    .findByPk(id)
    .then((u: any) => {
      user = u;
      if (!user) {
        throw new ExtendedError({
          code: 404,
          stack: 'not_found',
          message: 'not_found',
          errors: ['not_found'],
        });
      }

      if (typeof user.roles === 'string') {
        try {
          user.roles = JSON.parse(user.roles);
        } catch (e) {
          user.roles = ['USER'];
        }
      }

      // prevent frontend from hijacking encrypted password
      delete req.body.encryptedPassword;

      // PREVENT USERS FROM MODIFYFING USERS ROLES·
      if (!(req.user && AuthService.hasRole(req.user, 'ADMIN'))) {
        delete newUser.roles;
      }
      if (
        user.roles.indexOf('DEVELOPER') > -1 &&
        newUser.roles &&
        newUser.roles.indexOf('DEVELOPER') === -1
        ) {
        newUser.roles.push('DEVELOPER');
    }

    data = _.merge({}, user, newUser);
    data.roles = newUser.roles;
    // Delete if not required
    // data.lastModifiedOn = new Date();

    data.roles = JSON.stringify(data.roles);

    if (data.password) {
      return AuthService.beforeUpdate(data);
    }
    return data;
  })
    .then(() => {
      if (data) {
        return axel.models.user.em.update(data, {
          where: {
            [primaryKey]: data[primaryKey],
          },
        });
      }
    })
    .then((doc: any) => {
      if (doc) {
        if (data.roles && typeof data.roles === 'string') {
          try {
            data.roles = JSON.parse(data.roles);
          } catch (e) {
            axel.logger.warn(e);
          }
        }
      }
    })
    .then(() => axel.models.user.em.findByPk(parseInt(id)))
    .then((userModel: any) => {
      delete userModel.encryptedPassword;
      res.json({
        user: userModel,
      });
    })
    .catch((err: ExtendedError) => {
      Utils.errorCallback(err, res);
    });
  },

  delete(req: Request, resp: Response) {
    const id = req.param('userId');
    if (!Utils.checkIsMongoId(id, resp)) {
      return false;
    }

    const collection = axel.models.user.em;
    collection
    .findByPk(id)
    .then((user: any) => {
      if (!user) {
        return resp.status(200).json({
          body: `User with id ${id} wasn't found`,
        });
      }

      const deletedSuffix = `deleted-${Date.now()}-${Math.floor(Math.random() * 100000 + 1)}`;

      return collection
      .update(
      {
        email: `${user.email}-${deletedSuffix}`,
        phonenumber: `${user.phonenumber}-${deletedSuffix}`,
        facebookId: null,
        googleId: null,
        deactivated: true,
        deactivatedOn: new Date(),
      },
      {
        where: {
          [primaryKey]: user[primaryKey],
        },
      },
      )
      .then(() => {
        resp.status(200).json({
          body: true,
        });
      });
    })
    .catch((err: ExtendedError) => {
      Utils.errorCallback(err, resp);
    });
  },
};
