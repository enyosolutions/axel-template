module.exports = {
  identity: 'axelModelFieldConfig',
  collectionName: 'axel-model-field-config',
  url: '/axel-model-field-config', // url for front api
  additionalProperties: false,
  autoValidate: true,
  schema: {
    $id: 'http://acme.com/schemas/axel-model-field-config.json',
    type: 'object',
    properties: {
      id: {
        $id: 'id',
        type: 'number',
        title: 'Config id', // serves for front form fields
        description: 'The id of this item', // serves for front form hint
      },
      name: {
        type: 'string',
        field: {
          required: true,
        },
      },
      parentIdentity: {
        type: 'string',
        model: 'axelModelConfig',
        relation: '/api/automatic/axel-entity-config',
        foreignKey: 'identity',
        field: {
          required: true,
          readonly: true,
          disabled: true,
          type: 'enyoSelect',
        },
      },
      title: {
        type: 'string',
        field: {
          required: true,
        },
      },
      type: {
        type: ['string', 'array'],
        enum: ['string', 'number', 'array', 'object'],
        default: 'string',
        field: {},
        items: [{ type: 'string' }],
      },
      description: {
        type: 'string',
        default: 'string',
        field: {},
      },
      relation: {
        type: 'string',
        description: 'The object that this property is related to',
        example: 'user',
      },
      foreignKey: {
        type: 'string',
        description:
          'The field of the object that this property is related to (eg relation[foreignKey] == this property',
        example: 'user',
      },
      field: {
        type: 'object',
        title: 'Configuration of the behavior of the property in forms',
        properties: {
          title: {
            type: 'string',
            title: 'The title of the field',
          },
          type: {
            type: 'string',
            title:
              'The type of the field, comming from https://vue-generators.gitbook.io/vue-generators/fields',
          },
          inputType: {
            type: 'string',
            title:
              'The type of the field, when its a text input comming from https://vue-generators.gitbook.io/vue-generators/fields',
          },
          required: {
            type: 'boolean',
            title: 'Form field value is required',
          },
          hidden: {
            type: 'boolean',
            title: 'Form field is displayed',
          },
          disabled: {
            type: 'boolean',
            title: 'Field is disabled',
          },
          readonly: {
            type: 'boolean',
            title: 'Field is read only',
          },
          styleClasses: {
            type: 'string',
            title: 'The class that will be around the field',
            example: 'col-md-12',
          },
          min: {
            type: 'number',
            title: 'the minimum number of characters',
          },
          max: {
            type: 'number',
            title: 'the maximum number of characters',
          },
          fieldOptions: {
            title: 'Options to be used on custom forms fields like multiselect, toggle etc',
            type: 'object',
            properties: {
              multiple: {
                type: 'boolean',
                title: 'If the select is multiple (for selects)',
              },
              enum: {
                type: ['string', 'array'],
                title: 'Values',
                description: `The list of values to use for the select. If the value is string
                  and starts with $store then the value is taken from the vuejs $store`,
                example: '$store.listOfValues.users',
              },
              url: {
                type: 'string',
                title: 'The url to use to load the data for the select (ajax)',
                example: '/user',
              },
              trackBy: {
                type: 'string',
                title: 'The field to use as the value in the select',
                example: '_id',
              },
              label: {
                type: 'string',
                title: 'The field to use as the Label in the select',
                example: 'username',
              },
            },
          },
          validator: {
            type: 'array',
            description:
              'the validators used to validate fields https://vue-generators.gitbook.io/vue-generators/validation/built-in-validators',
          },
        },
      },
      column: {
        type: 'object',
        description: 'Configuration of the behavior of the property in lists',
        properties: {
          title: {
            type: 'string',
            title: 'The title of the field',
          },
          type: {
            type: 'string',
            description:
              'The type of the column, comming from https://vue-generators.gitbook.io/vue-generators/fields',
            enum: ['image', 'string', 'number', 'date', 'datetime'],
          },
          hidden: {
            type: 'string',
            title: 'If the form field is displayed',
          },
        },
      },
      createdOn: {
        type: ['string', 'object'],
        format: 'date-time',
        field: { readonly: true },
        column: {
          type: 'datetime',
        },
      },
      lastModifiedOn: {
        type: ['string', 'object'],
        format: 'date-time',
        field: { readonly: true },
        column: {
          type: 'datetime',
        },
      },
    },
    required: ['name', 'model'],
  },
  admin: {
    layout: {
      columns: [
        {
          legend: 'General',
          cols: 4,
          styleClasses: '',
          groups: [
            {
              legend: 'board',
              cols: 12,
              fields: ['id', 'name', 'parentIdentity', 'title', 'description'],
            },
          ],
        },
        {
          legend: 'Field',
          cols: 4,
          styleClasses: '',
          fields: [
            'field.title',
            'field.type',
            'field.inputType',
            'field.required',
            'field.readonly',
            'field.disabled',
          ],
        },
        {
          legend: 'Column',
          cols: 4,
          styleClasses: '',
          fields: ['column.type'],
        },
      ],
    },
    actions: {
      create: false,
      edit: true,
      view: true,
      delete: true,
    },
    options: {
      detailPageMode: 'page',
    },
  },
};
