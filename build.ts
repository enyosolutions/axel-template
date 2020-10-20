import s from 'shelljs';
const config = require('./tsconfig.json');
const outDir = config.compilerOptions.outDir;

s.rm('-rf', outDir);
s.mkdir(outDir);
s.cp('.env', `${outDir}/.env`);
s.mkdir('-p', `${outDir}/common/swagger`);
s.mkdir('-p', `${outDir}/common/services`);
s.cp('src/common/services/api.yml', `${outDir}/common/services/api.yml`);
