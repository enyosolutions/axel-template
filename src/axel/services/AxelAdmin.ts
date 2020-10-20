import async from 'async';
import { axel, Axel } from '../axel';
import { Request, Response, Application } from 'express';
import Utils from './Utils';
import SchemaValidator from './SchemaValidator';
import _ from 'lodash';

/**
 * COntains all the code necessary for bootstrapping the admin.
 *
 * @class AxelAdmin
 */
class AxelAdmin {
  /**
   *
   *
   * @param {Application} app
   * @returns {Promise<any>}
   * @memberof AxelAdmin
   */
  init(app: Application): Promise<any> {
    if (!axel.sqldb) {
      return Promise.reject('missing_sqldb');
    }
    return axel.models.axelModelConfig.em
      .findAll()
      .then((savedConfig: any[]) => {
        const insertions = Object.keys(axel.models).map(modelKey => {
          const model = axel.models[modelKey];
          const savedModel = savedConfig.find(elm => elm.identity === model.identity);
          if (savedModel) {
            return Promise.resolve();
          }
          return axel.models.axelModelConfig.em.create({ ...model, name: model.identity });
        });
        return Promise.all(insertions);
      })
      .then(() => {
        return Promise.all(
          Object.entries(axel.models).map(([key, entry]) => this.updateFieldsConfig(entry)),
        );
      })
      .catch(console.warn);
  }
  /**
   *
   *
   * @param {Obj} model
   * @returns {Promise<void>}
   * @memberof AxelAdmin
   */
  updateFieldsConfig(model: Obj): Promise<void> {
    if (!model.schema) {
      return Promise.resolve();
    }
      return axel.models.axelModelFieldConfig.em
        .findAll({
          where: {
            parentIdentity: model.identity,
          },
        })
        .then((savedFields: Obj[]) => {
          return savedFields
            .map(field => `${field.parentIdentity}-${field.name}`)
            .reduce((acc: any, f: any) => {
              acc[f] = f;
              return acc;
            }, {});
        })
        .then((savedFields: Obj) => {
          return Promise.all(
            Object.keys(model.schema.properties).map(prop => {
              const field = model.schema.properties[prop];
              const key = `${model.identity}-${prop}`;
              if (savedFields[key]) {
                return Promise.resolve();
              }
              return axel.models.axelModelFieldConfig.em.create({
                parentIdentity: model.identity,
                ...field,
                name: prop,
                title: field.title || _.startCase(prop),
              });
            }),
          );
        });
  }

  createConfigTables() {
    // create the tables, sequelize models and json schemas for the administration of models
  }

  connectToRouter() {
    // create api routes for getting merged configurations (see AppController.models(req, res))
  }

  /**
   *
   *
   * @param {Obj} model
   * @returns {Obj}
   * @memberof AxelAdmin
   */
  jsonSchemaToFrontModel(model: Obj): Obj {
    return {
      identity: model.identity,
      name: _.get(model, 'admin.name', model.name) || model.identity,
      namePlural: _.get(model, 'admin.namePlural', ''),
      pageTitle: _.get(model, 'admin.pageTitle', ''),
      apiUrl: _.get(model, 'apiUrl') || this.prefixUrl(model.url),
      url: _.get(model, 'apiUrl') || this.prefixUrl(model.url),
      routerPath: _.get(model, 'admin.routerPath', ''),
      schema: model.schema, // todo fetch from the other config api
      options: _.get(model, 'admin.options', {}),
      actions: _.get(model, 'admin.actions', {}),
      formOptions: _.get(model, 'admin.formOptions', {}),
      listOptions: _.get(model, 'admin.listOptions', {}),
      kanbanOptions: _.get(model, 'admin.kanbanOptions', {}),
      tableOptions: _.get(model, 'admin.tableOptions', {}),
    };
  }

  mergeModels(...args: any) {
    return _.mergeWith(args[0], args[1], (a: any, b: any) => {
      if (_.isArray(a) && b !== null && b !== undefined) {
        return a;
      }
      if (b === null && a) {
        return a;
      }
    });
  }

  /**
   * prefix the url with the automatic api config if needed
   *
   * @param {string} url
   * @returns {string} url
   * @memberof AxelAdmin
   */
  prefixUrl(url: string): string {
    const formatedUrl =
      axel.config.framework.automaticApi &&
      url &&
      url.indexOf(axel.config.framework.automaticApiPrefix) === -1
        ? axel.config.framework.automaticApiPrefix + '/' + url
        : url;
    return formatedUrl ? formatedUrl.replace(/\\/g, '/') : url;
  }

  serveModels(req: Request, res: Response): void {
    const mappedSavedConfig: Obj = {};
    axel.models.axelModelConfig.em
      .findAll()
      .then((savedConfig: any[]) => {
        savedConfig.forEach((config: Obj) => {
          delete config.id;
          delete config.createdOn;
          delete config.lastModifiedOn;
          mappedSavedConfig[config.identity] = config;
        });
      })
      .then(() => {
        const models = Object.keys(axel.models)
          .filter(
            key =>
              axel.config.framework.automaticApiBlacklistedModels.indexOf(key) === -1 &&
              axel.models[key].schema,
          )
          .map((modelId: string) => {
            const model: Obj = axel.models[modelId];
            const merged = this.mergeModels(
              this.jsonSchemaToFrontModel(model),
              mappedSavedConfig[axel.models[modelId].identity] || {},
            );
            if (modelId === 'axelModelConfig' && _.isString(merged.options)) {
              try {
                const result = SchemaValidator.validate(merged, 'axelModelConfig');
                if (!result.isValid) {
                  console.warn('[SCHEMA VALIDATION ERROR]', modelId, result, merged);
                }
              } catch (err) {
                throw new Error('error_wrong_json_format_for_model_definition');
              }
            }

            return merged;
          });

        res.json({
          body: models,
        });
      })
      .catch((err: Error) => Utils.errorCallback(err, res));
  }
}

export default new AxelAdmin();
