module.exports.plugins = {
  admin: {
    enabled: true,
    config: {
      // this config if available publicly in the admin. Do no add any secrets here..
      useNestedModels: false, // show nested models in admin
      useApiEndpoints: false, // use api endpoints defined by the user in admin
    }
  },
  'my-local-plugin': {
    enabled: false,
    location: 'src/plugins/my-local-plugin'
  }
};
