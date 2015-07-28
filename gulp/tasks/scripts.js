'use strict';

import util from 'gulp-util';
import gulp from 'gulp';
import jshint from 'gulp-jshint';

import paths from '../paths';

/**
 * The 'jshint' task defines the rules of our hinter as well as which files
 * we should check. It helps to detect errors and potential problems in our
 * JavaScript code.
 */
gulp.task('jshint', () => {
  return gulp.src(paths.app.scripts.concat(paths.gulpfile))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
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
    .then( () => {
      builder.buildSFX(inputPath, outputFile, outputOptions)
        .then( () => {
          return cb();
        })
        .catch( (ex) => {
          cb(new Error(ex));
        });
    });
});