/**
 *
 * @description :: Server-side logic for managing apps
 * @help        :: See http://Appjs.org/#!/documentation/concepts/Controllers
 * AppController
 */
import path from 'path';
import { Request, Response } from 'express';
import _ from 'lodash';
import SwaggerService from '../../../common/services/SwaggerService';
import yaml from 'js-yaml';
const swaggerJSDoc = require('swagger-jsdoc');

import Utils from '../../../common/services/Utils';
import SchemaValidator from '../../../axel/services/SchemaValidator';
import AxelAdmin from '../../../axel/services/AxelAdmin';

declare const axel: any;

const swaggerSpec = swaggerJSDoc(axel.config.swagger);
SwaggerService.generateModels(swaggerSpec);

class AppController {
  constructor() {}
  /**
   * Get the status of the app, along with the current api versions.
   * `AppController.status()`
   */
  status(req: Request, res: Response): void {
    res.json({
      status: 'OK',
    });
  }

  errorCodes(req: Request, res: Response): void {
    res.json({
      body: axel.config.errorCodes,
    });
  }

  /**
   *
   * @param  {[type]}
   * @param  {[type]}
   * @return {[type]}
   */
  ok(req: Request, res: Response): void {
    res.status(204);
  }

  debug(req: Request, res: Response): void {
    res.json({ status: new Date(), axel });
  }
  /**
   *
   *
   * @param {Request} req
   * @param {Response} res
   * @memberof AppController
   */
  swaggerJson(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  }

  /**
   *
   * @description get the swagger definition of the api in yaml
   * @param {Request} req
   * @param {Response} res
   * @memberof AppController
   */
  swaggerYml(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/plain');
    res.send(yaml.dump(swaggerSpec));
  }

  app(req: Request, res: Response): void {
    try {
      res.sendFile(path.resolve(process.cwd(), '../admin/dist/index.html'));
    } catch (e) {
      console.error(e);
      res.status(500).json({
        errors: ['not_found'],
        message: 'not_found',
      });
    }
  }
}

export default new AppController();
'';
