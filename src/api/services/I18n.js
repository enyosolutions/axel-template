const { axel } = require('axel-core/src');
const { I18n } = require('i18n');
const path = require('path');

const i18n = new I18n({
  locales: axel.config.i18n.locales,
  directory: axel.config.i18n.directory || path.join(process.cwd(), 'src/resources/locales')
});
module.exports = i18n;
