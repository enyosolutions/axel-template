/* eslint no-unused-vars: ["error", { "args": "none" }] */

// API middlewares
// context is an alias for context
// const {request : ExpressRequest, sequelizeQuery: SequelizeRequest } = context;
// api middlewares must return a promise or throw an error.

module.exports.beforeApiFind = (context) => {
};

module.exports.beforeApiFindOne = (context) => {
};

module.exports.beforeApiCreate = (context) => {
};

module.exports.beforeApiUpdate = (context) => {
};

module.exports.beforeApiDelete = (context) => {
};

module.exports.afterApiFind = (result, context) => { };
module.exports.afterApiFindOne = (result, context) => { };
module.exports.afterApiCreate = (result, context) => { };
module.exports.afterApiUpdate = (result, context) => { };
module.exports.afterApiDelete = (result, context) => { };
