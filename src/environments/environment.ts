// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { version } from './version';
export const environment = {
  production: false,
  version: version,
  domain: 'http://192.168.178.22:4200',
  gaKompendia: 'UA-164712943-1',
  gaForming: 'UA-2359879-1',
  dataDir: '/Users/uwereitter/Entwicklung/kompendia/data',
};
