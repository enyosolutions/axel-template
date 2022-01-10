const { config } = require('axel-core');
const { I18n } = require('i18n');
const path = require('path');

const i18n = new I18n({
  locales: config.i18n.locales,
  directory: config.i18n.directory || path.join(process.cwd(), 'src/resources/locales')
});
module.exports = i18n;
