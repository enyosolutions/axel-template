const _ = require('lodash');

/**
* [exports description]
* @type {Object}
  data = {entity, entityId, data, text, body, userId, createdOn};
*/

const roundValue = value => Math.round(value * 100) / 100;

module.exports = {
  init() { },
  groupByField(table, field, filters, options = { groupFunction: 'COUNT(*)' }, include) {
    return new Promise((resolve, reject) => {
      const opts = Object.assign({}, filters);
      options = Object.assign({ groupFunction: 'COUNT(*)' }, options);

      const queryTableName = table;
      if (queryTableName) {
        // if (queryTableName.split('_').length > 1) {
        //   let tempTableName = '';
        //   queryTableName.split('_').forEach((element) => {
        //     tempTableName += element.charAt(0).toUpperCase() + element.slice(1);
        //   });
        //   queryTableName = tempTableName;
        // } else {
        //   queryTableName = queryTableName.charAt(0).toUpperCase() + queryTableName.slice(1);
        // }
      }

      const fieldSource = include ? `${queryTableName}.${field}` : field;

      if (!axel.models[table]) {
        return reject(new Error(`model_${table}_does_not_exists`));
      }
      axel.models[table].em.findAll({
        where: opts,
        attributes: [
          [axel.sqldb.col(fieldSource), field],
          [axel.sqldb.literal(options.groupFunction), 'value']
        ],
        ...(_.isArray(include) ? {
          include,
          raw: true
        } : {}),
        group: field,
      }).then((list) => {
        const results = {
          list,
          total: list ? roundValue(
            list.reduce((reducer, current) => (parseFloat(current.value) || 0) + parseFloat(reducer), 0)
          ) : 0
        };
        resolve(results);
      }).catch(err => reject(err));
    });
  },
};
