import { readdirSync } from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

const files = readdirSync(__dirname);
const fileToMerge = files
  .filter(
    file =>
      (file.endsWith('.js') || file.endsWith('.ts')) &&
      !file.endsWith('index.ts')
  )
  .sort((a, b) => {
    if (a === 'local.js') {
      return 1;
    }
    return -1;
  });

let config: any = {};
fileToMerge.forEach(e => {
  try {
    const data = require(path.resolve(__dirname + '/' + e));

    config = _.merge(config, data.default || data);
  } catch (e) {
    console.warn(e);
  }
});

export default config;
