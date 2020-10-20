module.exports.framework = {
  automaticApi: true, // automatically connect database models to api enpoints those routes are overriden by any api you define
  automaticApiPrefix: '/api/automatic', // automatically connect database models to api enpoints,
  automaticApiBlacklistedModels: ['user'],
  validateDataWithJsonSchema: true,
  primaryKey: 'id', // '_id'
  primaryColor: '#FE4D17',
  secondaryColor: '#0A1351',
  user: {
    emailConfirmationRequired: false,
    publicId: false,
    username: false,
    accountManualVerification: false,
  },
  roles: {
    USER: { inherits: [] }, // can access the app
    BO: { inherits: ['USER'] }, // can access the ADMIN
    ADMIN: { inherits: ['BO'] },
    SUPERADMIN: { inherits: ['ADMIN'] },
  },
  allowedRoles: ['ADMIN', 'SUPERADMIN'],
  defaultPagination: 100,
  defaultLovPagination: 1000,
  axelAdmin: true,
  axelManager: true,
  responseFormat: {
    metadata: {
      page: 0,
      perPage: 20,
      totalCount: 0,
      previous: '',
      next: '',
    },
    body: [],
  },
  errorResponseFormat: {
    errors: ['error_codes'],
    message: 'error message',
  },
};
