module.exports.plugins = {
  admin: {
    enabled: true,
    config: {
      // this config if available publicly in the admin. Do no add any secrets here..
      userModelName: 'user', // The name to use to access the users model
      useNestedModels: false, // show nested models in admin
      useApiEndpoints: false, // use api endpoints defined by the user in admin
      rolesWithAccessToBackoffice: ['ADMINPANEL', 'ADMIN', 'SUPERADMIN'],
      location: '' // absolute path of the admin panel. Useful when you eject the backoffice.
    }
  },
  'my-local-plugin': {
    enabled: false,
    location: 'src/plugins/my-local-plugin'
  }
};
