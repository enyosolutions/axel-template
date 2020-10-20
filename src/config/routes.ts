// import express from 'express';

/*
type RouteObject = {
  routes : {
    [key: string]: RouteDefinitions;
  };
};
*/

export default {
  routes: {



    // Endpoints for Page
    // If you don't need some of them, be sure to delete the route AND the action in the controller...
    'GET /api/page/stats': 'PageController.stats',
    'GET /api/page': 'PageController.list',
    'GET /api/page/:id': 'PageController.get',
    'POST /api/page': 'PageController.post',
    'PUT /api/page/:id': 'PageController.put',
    'DELETE /api/page/:id': 'PageController.delete',

    /*
        // UNCOMMENT IF YOU NEED IMPORT AND EXPORT FORM EXCEL FEATURES
        'GET /api/page/export': 'PageController.export',
        'POST /api/page/import': 'PageController.import',
        'GET /api/page/import-template': 'PageController.importTemplate',
        */

    /*
     **************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     **************************************************************************
     */
    // '/': {
    //   controller: 'core/App',
    //   action: 'app',
    //   secure: false, // you need this if you defined you api as always secure !
    //   skipAssets: true,
    // },

    // demo redirected
    '/': { view: process.env.NODE_ENV !== 'development' ? 'manager' : 'home', secure: false },
    // demo
    '/front': (req: any, res: any) => res.redirect('/'),
    // '/admin': { secure: false, use: express.static('../admin/dist') },
    '/^(login|register|forgot-password|password-reset|app|reset-password)$': {
      controller: 'core/App',
      action: 'app',
      skipAssets: true,
      secure: false,
    },

    '/app.*': {
      controller: 'core/App',
      action: 'app',
      skipAssets: true,
      secure: false,
    },

    '/reset-password/:id': {
      controller: 'core/App',
      action: 'app',
      skipAssets: true,
      secure: false,
    },

    '/api/swagger.json': {
      controller: 'core/AppController',
      action: 'swaggerJson',
      secure: false,
    },

    '/api/swagger.yml': {
      controller: 'core/AppController',
      action: 'swaggerYml',
      secure: false,
    },

    '/console': {
      view: 'swagger',
      secure: false,
    },

    '/documentation': {
      view: 'redoc',
      secure: false,
    },


    'OPTIONS /api/*': 'core/AppController.ok',

    '/api/status': 'core/AppController.status',

    'GET /api/error_codes': 'core/AppController.errorCodes',

    'POST /api/auth/register': {
      controller: 'core/UserSqlController',
      action: 'create',
      secure: false,
    },
    'POST /api/auth/login': {
      controller: '@axel/controllers/AuthController',
      action: 'login',
      secure: false,
    },

    'POST /api/auth/admin_login': {
      controller: 'core/AuthController',
      action: 'login',
      secure: false,
    },

    'POST /api/auth/google/callback': {
      controller: 'core/AuthController',
      action: 'googleCallback',
      secure: false,
    },

    'POST /api/auth/facebook/callback': {
      controller: 'core/AuthController',
      action: 'facebookCallback',
      secure: false,
    },

    'POST /api/auth/forgot': {
      controller: 'core/AuthController',
      action: 'forgot',
      secure: false,
    },
    'GET /api/auth/user': 'core/AuthController.get',

    'GET /api/auth/confirm/:email': {
      controller: 'core/AuthController',
      action: 'confirmUserRegistration',
      secure: false,
    },

    'GET /api/user/token/:resetToken': 'core/UserSqlController.getByResetToken',
    'POST /api/user/reset/:resetToken': {
      controller: 'core/UserSqlController',
      action: 'reset',
      secure: false,
    },
    'GET /api/user/exists': 'core/UserSqlController.exists',
    'POST /api/user': {
      controller: 'core/UserSqlController',
      action: 'create',
      secure: false,
    },
    'GET /api/user': 'core/UserSqlController.list',

    'GET /api/user/:userId': 'core/UserSqlController.get',
    'PUT /api/user/:userId': 'core/UserSqlController.update',
    'DELETE /api/user/:userId': 'core/UserSqlController.delete',

    // //// DO NOT TOUCH THIS LINE

    // '*': function (req, res) { return res.json(404, 'ENDPOINT_NOT_FOUND') }
  },
};
