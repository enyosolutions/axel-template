// const mongo = require('mongodb');
import { Request, Response } from 'express';
const crypto = require('crypto');
const stringify = require('json-stringify-safe');
import Sequelize from 'sequelize';
import _ from 'lodash';
import {ExtendedError} from '../../axel';

// declare const Sequelize: any;
declare const axel: any;

const primaryKey = axel.config.framework.primaryKey;

const Utils = {
  md5(str: string) {
    return crypto
      .createHash('md5')
      .update(str)
      .digest('hex');
  },
  formUrlEncoded(x: string) {
    return Object.keys(x).reduce((p, c: any) => `${p}&${c}=${encodeURIComponent(x[c])}`, '');
  },
  slugify(text: string) {
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special chars
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .trim();
  },

  sendError(code: number = 500, message: string, response: Response) {
    const err = Utils.stringToError(code, message, response);
    if (response) {
      Utils.errorCallback(err, response as any);
    }
    return err;
  },

  stringToError(code: number = 500, message: string, response?: Response) {
    const err = new ExtendedError({ code, message });
    return err;
  },

  safeError(err: ExtendedError) {
    try {
      err = JSON.parse(stringify(err));
      return err;
    } catch (e) {
      err = {
        name: err.name,
        message: err.message,
        code: err ? err.code : undefined,
      };
      return err;
    }
  },

  errorCallback(err: ExtendedError, response: Response) {
    if (!response.headersSent) {
      if (!err) {
        axel.logger.error(err);
        throw new Error('error_handler_called_without_error_arg');
      }
      if (err.name === 'SequelizeValidationError') {
        if (err.errors && Array.isArray(err.errors)) {
          //@ts-ignore
          err.errors = err.errors.map((e: Error) => e.message);
        }
        err.message = 'validation_error';
      }

      if (err.name === 'SequelizeDatabaseError') {
        if (err.errors && Array.isArray(err.errors)) {
          //@ts-ignore
          err.errors = err.errors.map((e: Error) => e.sqlMessage);
        } else {
          //@ts-ignore
          err.errors = [err.sqlMessage || err.message];
        }
        err.message = 'database_error';
      }

      if (err.message === 'Validation error') {
        if (err.errors && Array.isArray(err.errors)) {
          //@ts-ignore
          err.errors = err.errors.map((e: any) => `${e.path}_${e.validatorKey}`);
        }
        err.message =
          err.errors && err.errors[0]
            ? _.isString(err.errors[0])
              ? err.errors[0]
              : err.errors[0].message
            : 'validation_error';
      }
      let errors;
      if (err.errors && Array.isArray(err.errors)) {
        if (axel.config.env === 'production') {
          errors =
            //@ts-ignore
            err.errors.map((e: any) => (_.isString(e) ? e : e.message));
        } else {
          //@ts-ignore
          errors = err.errors.map(Utils.safeError);
        }
      } else {
        errors = [err.message];
      }
      response.status(err.code && parseInt(err.code) < 504 ? parseInt(err.code) : 400).json({
        message: err.message || 'global_error',
        errors: errors,
      });
    }
    /*
    if (Raven.getContext()) {
      Raven.mergeContext({
        user: axel.session && axel.session.token,
        app: axel.config && axel.config.env,
        env: axel.config && axel.config.env,
        tags: {
          app: axel.config && axel.config.env,
          env: axel.config && axel.config.env,
        },
      });
    }
    Raven.captureException(err);
    */
  },

  /**
   * check that the id has the correct mongoID format
   */
  checkIsMongoId: (id: string, resp: Response) => {
    if (!id) {
      return resp.status(404).json({
        errors: ['missing_id'],
      });
    }

    if (id.length < 24 && Number.isNaN(Number(id))) {
      axel.logger.warn('WRONG ID :: ', id);
      resp.status(404).json({
        errors: ['wrong_id_format'],
        message: 'wrong_id_format',
      });
      return false;
    }
    return true;
  },

  /**
   *
   * Inject userId if required
   */
  injectUserId(data: any, user: any) {
    if (!data.userId && user && user[primaryKey]) {
      data.userId = user[primaryKey];
    }
    return data;
  },

  /**
   *
   */
  /**
   *
   * Inject params from the request into the query object that we'll user to query the database
   * @param {Request} req
   * @param {*} [query={
   *       userId: undefined,
   *       filters: undefined,
   *       tags: undefined,
   *       createdOn: undefined,
   *     }]
   * @returns
   */
  injectQueryParams(
    req: Request,
    query: any = {
      userId: undefined,
      filters: undefined,
      tags: undefined,
      createdOn: undefined,
    },
  ) {
    const Op = Sequelize.Op;
    // filters from the ui. Ex table fields
    // @deprecated use _filters
    if (req.query.filters && _.isObject(req.query.filters)) {
      const filters: Obj = req.query.filters;
      Object.keys(filters)
        .filter(f => filters[f])
        .forEach(i => {
          if (filters[i]) {
            query[i] = {
              [Op.like]: `${filters[i]}%`,
            };
          }
        });
    }

    // filters from the ui. Ex table fields
    if (req.query._filters && _.isObject(req.query._filters)) {
      const filters: Obj = req.query._filters;
      Object.keys(filters)
        .filter(f => filters[f])
        .forEach(i => {
          if (filters[i]) {
            query[i] = { [Op.like]: `${filters[i]}%` };
          }
        });
    }

    if (req.query.tags && _.isObject(req.query.tags)) {
      const tags = _.isArray(req.query.tags)
        ? req.query.tags
        : _.isString(req.query.tags)
        ? req.query.tags.split(',')
        : [];
      query.tags = {
        $all: tags,
      };
    }

    if (req.query.range && _.isObject(req.query.range)) {
      const { startDate, endDate } = req.query.range as { startDate?: string; endDate?: string };
      if (startDate && (_.isString(startDate) || _.isNumber(startDate))) {
        if (!query.createdOn) {
          query.createdOn = {};
        }
        query.createdOn[Op.gte] = new Date(startDate);
      }

      if (endDate && (_.isString(endDate) || _.isNumber(endDate))) {
        if (!query.createdOn) {
          query.createdOn = {};
        }
        query.createdOn[Op.lte] = new Date(endDate);
      }
    }

    const userId = req.params.userId || req.query.userId;
    if (userId) {
      query.userId = userId;
    }

    // automatic override of all queries params
    // if (req.query.query) {
    //   query = req.query.query;
    // }
    return query;
  },

  injectSortParams(req: Request, options: any = {}) {
    if (!options.sort) {
      if (req.query.sort && _.isObject(req.query.sort)) {
        const sort: Obj = req.query.sort;
        options.sort = {};
        Object.keys(sort).forEach(i => {
          options.sort[i] = parseInt(sort[i]);
        });
      } else {
        options.sort = {
          createdOn: -1,
        };
      }
    }
    return options;
  },

  injectPaginationQuery(
    req: Request,
    options: { sort?: any; primaryKey?: string } = {
      sort: null,
      primaryKey: '',
    },
  ): any {
    const isListOfValues: boolean = req.query.listOfValues ? !!req.query.listOfValues : false;
    const startPage: number = req.query.page ? _.toNumber(req.query.page) : 0;
    let limit: number = isListOfValues
      ? axel.config.framework.defaultLovPagination
      : req.query.perPage
      ? req.query.perPage
      : axel.config.framework.defaultPagination;
    limit = _.toNumber(limit);
    const offset = startPage * limit;
    const sortOptions = req.query.sort || options.sort;
    const order = _.toPairs(
      sortOptions ? sortOptions : { [options.primaryKey || primaryKey]: 'DESC' },
    );
    return {
      listOfValues: isListOfValues,
      startPage,
      limit,
      offset,
      order,
    };
  },

  injectSearchParams(req: Request, query: Obj = {}) {
    if (req.query.search) {
      if (typeof req.query.search === 'string') {
        req.query.search = req.query.search.trim();
      }
      query.$text = {
        $search: req.query.search,
        $language: req.query.locale || 'en',
      };
    }

    return query;
  },

  injectSqlSearchParams(
    req: Request,
    query: any = {},
    options: { modelName?: string; fields?: [] } = {
      modelName: '',
      fields: undefined,
    },
  ) {
    const Op = Sequelize.Op;
    if ((!options.modelName || !axel.models[options.modelName]) && !options.fields) {
      throw new Error('search_params_injections_missing_model_name');
    }
    if (req.query.search) {
      const params = {};
      if (!query[Op.or]) {
        query[Op.or] = [];
      }
      let fields;
      if (options.modelName) {
        const dataModel = axel.models[options.modelName].entity;
        fields = Object.keys(dataModel.attributes);
      } else {
        fields = options.fields;
      }
      if (fields) {
        fields.forEach(i => {
          query[Op.or].push({ [i]: { [Op.like]: `%${req.query.search}%` } });
        });
      }
    }

    return query;
  },

  /**
   * Removes undefiend fields from the object query since the cause sequelize to crash
   * @param query
   */
  cleanSqlQuery(query: { [key: string]: any }) {
    if (!query) {
      return query;
    }
    Object.keys(query).forEach(key => {
      if (query[key] === undefined) {
        delete query[key];
      }
    });
    return query;
  },

  removeAdditionalProperty(scheme: any, data: any) {
    return _.pick(data, _.keys(scheme.schema.properties));
  },

  dashedToNormal(str: string) {
    return str.replace(/\s+/g, '-').toLowerCase();
  },

  formatName(firstname = null, lastname = null, company = null, optional = false) {
    let name: string | null = '';
    if (!firstname && !lastname && !company) {
      return name;
    }

    if (firstname || lastname) {
      name = `${firstname} ${lastname}`;
      if (company && !optional) {
        name += ` [${company}]`;
      }
    } else {
      name = company;
    }

    return name ? name.trim() : '';
  },

  objectTrim(item: any) {
    Object.keys(item).forEach(key => {
      if (_.isString(item[key])) {
        item[key] = item[key].trim();
      }
    });
    return item;
  },

  validateDate(date: string) {
    const timestamp = Date.parse(date);
    if (Number.isNaN(timestamp) === true) {
      return false;
    }
    return true;
  },

  getEntityManager(req: Request | string, res: Response) {
    const endpoint = _.isString(req) ? req : req.params.endpoint;
    if (!axel.models[endpoint] || !axel.models[endpoint].repository) {
      console.warn('REQUESTED  ENDPOINT', endpoint, 'DOES NOT EXISTS');
      res.status(404).json({
        errors: ['model_not_found_error'],
        message: 'model_not_found_error',
      });
      return false;
    }
    return axel.models[endpoint].em;
  },

  getRawObject(item: any): any {
    if (Array.isArray(item)) {
      return item.map(Utils.getRawObject);
    }

    if (item.rows && Array.isArray(item.rows)) {
      return item.rows.map(Utils.getRawObject);
    }

    const output = item.get();
    /* eslint-disable no-underscore-dangle,no-unused-expressions */
    item._options.includeNames &&
      item._options.includeNames.forEach((inc: string) => {
        output[inc] = Utils.getRawObject(item[inc]);
      });
    return output;
  },
};

export default Utils;
