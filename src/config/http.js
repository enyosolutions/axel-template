/**
 * HTTP Server Settings
 * (App.config.http)
 *
 * Configuration for the underlying HTTP server in App.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://App.s.org/#!/documentation/reference/App.config/App.config.http.html
 */

const skipper = require('skipper');
const express = require('express');
const morgan = require('morgan');
const stringify = require('json-stringify-safe');

module.exports.http = {
  /** **************************************************************************
   *                                                                           *
   * Express middleware to use for every App.request. To add custom          *
   * middleware to the mix, add a function to the middleware config object and *
   * add its key to the "order" array. The $custom key is reserved for         *
   * backwards-compatibility with App.v0.9.x apps that use the               *
   * `customMiddleware` config option.                                         *
   *                                                                           *
   *************************************************************************** */

  middleware: {
    /** *************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP request. (the App.*
     * router is invoked by the "router" middleware below.)                     *
     *                                                                          *
     ************************************************************************** */

    order: [
      'ravenRequesthandler',
      'cookieParser',
      'session',
      'token',
      'bodyParser',
      'compress',
      'staticAssets',
      '$custom',
      'morgan',
      'apiLogger',
      'ravenErrorhandler',
      'router',

      'www',
      'favicon',
      'error404',
      '404',
    ],

    /** **************************************************************************
     *                                                                           *
     * Example custom middleware; logs each request to the console.              *
     *                                                                           *
     *************************************************************************** */
    error404(req, res) {
      res.notFound();
    },


    apiLogger(req, res, next) {
      try {
        if (App.config.environment && App.config.environment === 'test') {
          return next();
        }
        const isStaticElement = ['.js', '.css', '.jpg', '.png', '.tff', '.woff2', '.map']
          .filter(elm => _.endsWith(req.path.toLowerCase(), elm)).length > 0;
        const doNotLog = req.path
          && (req.path.indexOf('login') > -1 || req.path.indexOf('register') > -1 || req.path.indexOf('auth') > -1);

        if (
          req.method === 'OPTIONS'
          || doNotLog
          || isStaticElement
          || (
            req.path.indexOf('/api/advertisement') > -1
            && req.method !== 'GET')
        ) {
          if (!isStaticElement) {
            App.log.verbose('APILOGGER::', 'SKIPPED ROUTE LOGGING for', req.path);
          }
        } else if (App.models.api_log) {
          const end = res.end;
          res.end = function (chunk, encoding) {
            if (res.statusCode === 200) {
              // save res code to api...
            }

            res.end = end;
            res.end(chunk, encoding);
          };
          App.models.api_log.em
            .unifiedInsert({
              path: req.path,
              host: req.hostname,
              method: req.method,
              userId: req.user && req.user[axel.config.framework.primaryKey],
              body: stringify(!doNotLog ? req.body : {}),
              query: stringify(!doNotLog ? req.query : {}),
              ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip,
            })
            .catch(err => console.warn(err));
        }
      } catch (err) {
        console.error(err);
      }
      next();
    },

    staticAssets: express.static('assets'),
    morgan: morgan('dev', {
      skip(req, res) { return res.statusCode < 400; }
    }),

    ravenRequesthandler(req, res, next) {
      if (App.services.Raven) {
        App.services.Raven.requestHandler(req, res, next);
      } else {
        next();
      }
    },

    ravenErrorhandler(req, res, next) {
      if (App.services.Raven) {
        App.services.Raven.errorHandler(req, res, next);
      } else {
        next();
      }
    },
  },

  // compress: require('compression')()

  /** *************************************************************************
   *                                                                          *
   * The body parser that will handle incoming multipart HTTP requests. By    *
   * default as of v0.10, App.uses                                          *
   * [skipper](http://github.com/balderdashy/skipper). See                    *
   * http://www.senchalabs.org/connect/multipart.html for other options.      *
   *                                                                          *
   ************************************************************************** */

  // bodyParser: require('skipper')


  /** *************************************************************************
   *                                                                          *
   * The number of seconds to cache flat files on disk being served by        *
   * Express static middleware (by default, these files are in `.tmp/public`) *
   *                                                                          *
   * The HTTP static cache is only active in a 'production' environment,      *
   * since that's the only time Express will cache flat-files.                *
   *                                                                          *
   ************************************************************************** */

  // cache: 31557600000
};
