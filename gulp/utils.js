'use strict';

import util from 'gulp-util';

export const LOG = util.log;
export const COLORS = util.colors;

import {DEFAULT_SERVER_PORT} from './const.js';

//launch your task with `--port 9002` for example
export const SERVER_PORT = util.env.port || DEFAULT_SERVER_PORT;

//launch your task with `--open` `--open false` for example
export const OPEN = util.env.open === 'false' ? false : true;

//launch your task with `--disable-watch` for example
export const DISABLE_WATCH = util.env['disable-watch'];

var environment = (util.env.env || 'dev').toLowerCase();
if (environment === true) {
  environment = 'dev';
}
else if (['dev', 'prod', 'test'].indexOf(environment) === -1) {
  throw new Error('--env flag only accepts dev/prod/test')
}
LOG(COLORS.yellow('### Running in ' + environment + ' ###'));

export const ENV = environment;
