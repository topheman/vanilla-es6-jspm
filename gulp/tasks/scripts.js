'use strict';

import util from 'gulp-util';
import gulp from 'gulp';
import jshint from 'gulp-jshint';
import cache from 'gulp-cache';

import paths from '../paths';

/**
 * Returns a jshint gulp task according to the env
 * @param {String} env "dev"|"test"
 * @returns {*}
 */
function generateJshintTask(env) {
  var src;
  switch (env.toLowerCase()) {
    case 'test':
      src = [].concat(paths.app.scripts, paths.gulpfile, paths.test.stubs.scripts, paths.test.unit.spec);
      break;
    default: //(dev)
      src = [].concat(paths.app.scripts, paths.gulpfile);
      break;
  }
  return gulp.src(src)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
}

/**
 * The 'jshint' task defines the rules of our hinter as well as which files
 * we should check. It helps to detect errors and potential problems in our
 * JavaScript code.
 *
 * It can be launched in test env (which will also hint all test related tasks)
 * Those tasks are splitted for performance
 */
gulp.task('jshint', () => {
  return generateJshintTask('dev');
});
gulp.task('jshint:test', () => {
  return generateJshintTask('test');
});

/**
 * Create JS production bundle.
 */
gulp.task('bundle', ['jshint'], (cb) => {
  const Builder = require('systemjs-builder');
  const builder = new Builder();
  const inputPath = 'src/app/bootstrap';
  const outputFile = paths.tmp.scripts + 'app.bootstrap.build.js';
  const outputOptions = {sourceMaps: true, config: {sourceRoot: paths.tmp.scripts}};

  builder.loadConfig('./jspm.config.js')
    .then(() => {
      builder.buildSFX(inputPath, outputFile, outputOptions)
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
