'use strict';

import util from 'gulp-util';

export const LOG = util.log;
export const COLORS = util.colors;

const argv = util.env;
export const ENV = !!argv.env ? argv.env.toUpperCase() : 'DEV';