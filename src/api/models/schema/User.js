const roles = ['USER', 'ADMIN', 'ADMINPANEL'];
module.exports = {
  identity: 'user',
  apiUrl: '/api/user',
  additionalProperties: false,
  autoValidate: true,
  primaryKeyField: 'id',
  displayField: '{{firstName}} {{lastName}}',
  searchableFields: ['id', 'roles', 'username', 'firstName', 'lastName', 'email'],
  schema: {
    $id: 'http://acme.com/schemas/user.json',
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        column: {},
        field: {
          readonly: true,
          visible: '{{ context.mode !== "create"}}'
        },
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
      roles: {
        type: 'array',
        default: ['USER'],
        enum: roles,
        items: {
          type: 'string',
          enum: roles,
        },
        column: {
          type: 'object',
          multiple: true,
          visible: false
        },
        field: {
          type: 'VSelect',
          cols: 12,
          fieldOptions: {
            multi: true,
            multiple: true,
            options: roles,
          },
          displayOptions: {
            multiple: true,
            type: 'object',
          },
          options: roles,
        }
      },
      encryptedPassword: {
        type: 'string',
        column: {
          visible: false,
        },
        field: {
          visible: false,
        },
      },
      phonenumber: {
        type: 'string',
        maxLength: 50,
        column: {},
        field: {},
      },
      passwordResetToken: {
        type: 'string',
        column: {
          visible: false,
        },
        field: {
          visible: false,
        },
      },
      passwordResetRequestedOn: {
        type: 'string',
        format: 'date-time',
        column: {
          type: 'date',
        },
        field: {
          type: 'dateTime',
        },
      },
      activationToken: {
        type: 'string',
        column: {
          visible: false,
        },
        field: {
          visible: false,
        },
      },
      googleId: {
        type: 'string',
        column: {},
        field: {},
      },
      googleToken: {
        type: 'string',
        column: {
          visible: false,
        },
        field: {
          visible: false,
        },
      },
      facebookId: {
        type: 'string',
        column: {},
        field: {},
      },
      facebookToken: {
        type: 'string',
        column: {
          visible: false,
        },
        field: {
          visible: false,
        },
      },
      isActive: {
        type: 'boolean',
      },
      hasConfirmedEmail: {
        type: 'boolean',
        default: false,
        column: {
          visible: false,
        },
        field: {
          visible: '{{ context.mode === "view" }}'
        },
      },

      lastConnexionOn: {
        type: 'string',
        format: 'date-time',
        column: {
          type: 'date',
          visible: '{{ context.mode === "view" }}'
        },
        field: {
          type: 'dateTime',
          readonly: true,
          visible: '{{ context.mode === "view" }}'
        },
      },
      createdOn: {
        type: 'string',
        format: 'date-time',
        column: {
          type: 'datetime',
          visible: '{{ context.mode === "view" }}'
        },
        field: {
          type: 'dateTime',
          readonly: true,
          visible: '{{ context.mode === "view" }}'
        },
      },
      lastModifiedOn: {
        type: 'string',
        format: 'date-time',
        column: {
          type: 'datetime',
          visible: '{{ context.mode === "view" }}'
        },
        field: {
          type: 'dateTime',
          readonly: true,
          visible: '{{ context.mode === "view" }}'
        },
      },
    },
    required: ['firstName', 'lastName', 'email'],
  },
  admin: {
    name: 'Utilisateur',
    namePlural: 'Utilisateurs',
    nestedModels: [
      {
        extends: 'indicator',
        config: {
          name: 'Indicateur',
          namePlural: 'Indicateurs',
          title: 'Indicateurs',
          url: '/api/indicator?filters[userId]={{parent.id}}&options[searchMode]=exact'
        }
      }
    ]
  },
};
