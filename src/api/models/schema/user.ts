module.exports = {
  identity: 'user',
  url: '/api/user',
  additionalProperties: false,
  autoValidate: true,
  schema: {
    $id: 'http://acme.com/schemas/user.json',
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        column: {},
        field: {},
      },
      firstName: {
        type: 'string',
        column: {},
        field: {
          required: true,
        },
        maxLength: 100,
      },
      lastName: {
        type: 'string',
        column: {},
        field: {
          required: true,
        },
        maxLength: 100,
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 100,
        column: {},
        field: {
          required: true,
        },
      },
      encryptedPassword: {
        type: 'string',
        column: {},
      },
      settings: {
        type: 'string',
        column: {},
        field: {
          required: true,
        },
      },
      preferredLanguage: {
        type: 'string',
        column: {},
        field: {},
        default: 'pt',
        maxLength: 2,
      },
      phonenumber: {
        type: 'string',
        maxLength: 50,
        column: {},
        field: {},
      },
      passwordResetToken: {
        type: 'string',
        column: {},
        field: {},
      },
      passwordResetRequestedAt: {
        type: 'string',
        format: 'date-time',
        column: {
          type: 'date',
        },
        field: {
          format: 'date-time',
          type: 'dateTime',
        },
      },
      activationToken: {
        type: 'string',
        column: {},
        field: {},
      },
      googleId: {
        type: 'string',
        column: {},
        field: {},
      },
      googleToken: {
        type: 'string',
        column: {},
        field: {
          required: true,
        },
      },
      facebookId: {
        type: 'string',
        column: {},
        field: {},
      },
      facebookToken: {
        type: 'string',
        column: {},
        field: {
          required: true,
        },
      },
      accountType: {
        type: 'string',
        column: {},
        enum: ['provider', 'client', 'moderator'],
      },
      isActive: {
        type: 'boolean',
      },
      hasCompletedRegistration: {
        type: 'boolean',
      },
      lastConnexionOn: {
        type: 'string',
        format: 'date-time',
        column: {
          type: 'date',
        },
        field: {
          format: 'date-time',
          type: 'dateTime',
        },
      },
      createdOn: {
        type: 'string',
        format: 'date-time',
        column: {
          type: 'datetime',
        },
        field: {
          format: 'date-time',
          type: 'dateTime',
          readonly: true,
        },
      },
      lastModifiedOn: {
        type: 'string',
        format: 'date-time',
        column: {
          type: 'datetime',
        },
        field: {
          format: 'date-time',
          type: 'dateTime',
          readonly: true,
        },
      },
    },
    required: ['firstName', 'lastName', 'email'],
  },
};