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
if (['dev', 'dist', 'test'].indexOf(environment) === -1) {
  throw new Error('--env flag only accepts dev/dist/test')
}
if (!process.env.ENV) {
  LOG(COLORS.yellow('[INFOS] Setting process.env.ENV=' + environment));
  process.env.ENV = environment;
}
LOG(COLORS.yellow('### Running in ' + environment + ' ###'));

export const ENV = environment;

export const WITH_DOCS = util.env['with-docs'] || process.env.WITH_DOCS;

if(WITH_DOCS){
  LOG(COLORS.yellow('### Running in --with-docs mode ###'));
}

/**
 * @warn this is still in progress
 *
 * @todo add config.runUnitTestsOnChange: true in package.json
 * @todo add npm run test-unit to the watch tasks
 *
 * For grunt serve task - Unit tests will be run on file changes if:
 * In package.json, config.runUnitTestsOnChange = true (turning it to false won't run the tests on change)
 * You can override this behavior by passing the flag :
 * * `--run-unit-tests-on-change` (to run the unit tests)
 * * `--run-unit-tests-on-change false` (not to run the unit tests)
 */
var runUnitTestsOnChange = (pkg.config ? (pkg.config.runUnitTestsOnChange !== undefined ? pkg.config.runUnitTestsOnChange : true) : true);
if (util.env['run-unit-tests-on-change'] !== undefined) {
  runUnitTestsOnChange = util.env['run-unit-tests-on-change'] === 'false' ? false : util.env['run-unit-tests-on-change'];
}
export const RUN_UNIT_TESTS_ON_RELOAD = runUnitTestsOnChange;
