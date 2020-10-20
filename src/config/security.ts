
/**
 */

module.exports.security = {
  secureAllEndpoints: true, // if true then all endpoints must pass the security middleware
  securityPolicy: 'isAuthorized', // policy to use for securing the endpoints
  // goes directly into the cors middleware config
  cors: {
    /*
     **************************************************************************
     *                                                                          *
     * Allow CORS on all routes by default? If not, you must enable CORS on a   *
     * per-route basis by either adding a "cors" configuration object to the    *
     * route config, or setting "cors:true" in the route config to use the      *
     * default settings below.                                                  *
     *                                                                          *
     **************************************************************************
     */

    origin: [
      'http://localhost:8000',
      'http://localhost:8080',
      'http://localhost:8888',
      'http://localhost:3000',
      'http://localhost:1337',
      'http://localhost:1905',
      'http://localhost:3333',
      'http://localhost:4444',
      'https://freelance-platform-front.wip.enyosolutions.com',
      'https://freelance-platform-front.dev.enyosolutions.com',
      'http://freelance-platform-front.dev.enyosolutions.com',
      'https://freelance-platform-api.dev.enyosolutions.com',
      'https://freelance-platform-front.staging.enyosolutions.com',
      'https://freelanceo.com',
      'http://localhost:3474',
    ],

    /*
     **************************************************************************
     *                                                                          *
     * Which methods should be allowed for CORS requests? This is only used in  *
     * response to preflight requests (see article linked above for more info)  *
     *                                                                          *
     **************************************************************************
     */

    methods: 'GET,POST,PUT,DELETE,OPTIONS,HEAD',

    /*
     **************************************************************************
     *                                                                          *
     * Which headers should be allowed for CORS requests? This is only used in  *
     * response to preflight requests.                                          *
     *                                                                          *
     **************************************************************************
     */

    allowedHeaders: 'Authorization, Content-Type, Cache-Control, Origin, X-Requested-With, Accept',
  },
};
