'use strict';

import util from 'gulp-util';

export const LOG = util.log;
export const COLORS = util.colors;

import pkg from '../package.json';

//launch your task with `--port 9002` for example
export const PORT = util.env.port || (pkg.config ? (pkg.config.port ? pkg.config.port : null) : null) || 9000;

//launch your task with `--open` `--open false` for example
export const OPEN = util.env.open === 'false' ? false : true;

//launch your task with `--disable-watch` for example
export const DISABLE_WATCH = util.env['disable-watch'];

// if no --env flag, environment variable ENV is taken,
// if none of them is set, 'dev' is set by default
// if you pass by --env flag, it will be reflected in process.env.ENV
var environment = ((util.env.env === true ? 'dev' : util.env.env) || process.env.ENV || 'dev').toLowerCase();
if (['dev', 'prod', 'test'].indexOf(environment) === -1) {
  throw new Error('--env flag only accepts dev/prod/test')
}
if (!process.env.ENV) {
  LOG(COLORS.yellow('[INFOS] Setting process.env.ENV=' + environment));
  process.env.ENV = environment;
}
LOG(COLORS.yellow('### Running in ' + environment + ' ###'));

export const ENV = environment;
