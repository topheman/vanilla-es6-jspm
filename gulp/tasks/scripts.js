'use strict';

import util from 'gulp-util';
import gulp from 'gulp';
import jshint from 'gulp-jshint';
import cache from 'gulp-cache';
import footer from 'gulp-footer';
import gulpif from 'gulp-if';

import {LOG,COLORS,ENV} from '../utils.js';
import paths from '../paths';

/**
 * The 'jshint' task defines the rules of our hinter as well as which files
 * we should check. It helps to detect errors and potential problems in our
 * JavaScript code.
 *
 * It can be launched in test env (which will also hint all test related tasks)
 */
gulp.task('jshint', () => {
  var src;
  switch (ENV) {
    case 'test':
      src = [].concat(paths.app.scripts, paths.gulpfile, paths.config.karma, paths.config.e2e, paths.test.stubs, paths.test.unit, paths.test.e2e);
      break;
    case 'dev':
    default:
      src = [].concat(paths.app.scripts, paths.gulpfile, paths.config.karma, paths.config.e2e);
      break;
  }
  return gulp.src(src)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jspmconfig', () => {
  var injection;
  if(ENV === 'test'){
    var jspmOverride = require(paths.test.config.jspmOverride);
    LOG(COLORS.yellow('[INFOS] Using jspm.override.json:'))
    var injection = "System.config("+JSON.stringify(jspmOverride)+")";
    LOG(COLORS.yellow(injection));
  }
  return gulp.src(paths.config.jspm)
    .pipe(gulpif(ENV === 'test', footer(injection)))
    .pipe(gulp.dest(paths.tmp.config.basePath));
});

/**
 * Create JS production bundle.
 *
 * If the flag `--env test` was passed, make a production bundle based on the test configuration
 */
gulp.task('bundle', ['jshint', 'jspmconfig'], (cb) => {
  const Builder = require('systemjs-builder');
  const builder = new Builder();
  const inputPath = 'src/app/bootstrap';
  const outputFile = paths.tmp.scripts + 'app.bootstrap.build.js';
  const outputOptions = {sourceMaps: true, config: {sourceRoot: paths.tmp.scripts}};

  builder.loadConfig(paths.tmp.config.jspm)
    .then(() => {
      builder.buildStatic(inputPath, outputFile, outputOptions)
        .then(() => {
          return cb();
        })
        .catch((ex) => {
          cb(new Error(ex));
        });
    });
});


/**
 * gulp-cache is used in some tasks to save time
 * Though, when developing/debugging the gulp part, the cache can mess with the streams
 * This will clear it.
 */
gulp.task('cache-clean', (done) => {
  return cache.clearAll(done);
});
