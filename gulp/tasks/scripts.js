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
gulp.task('jshint', function () {
  return gulp.src(paths.app.scripts.concat(paths.gulpfile))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

/**
 * Create JS production bundle.
 */
gulp.task('bundle', ['jshint'], function (cb) {
  var Builder = require('systemjs-builder');
  var builder = new Builder();
  var inputPath = 'src/app/bootstrap';
  var outputFile = paths.tmp.scripts + 'app.bootstrap.build.js';
  var outputOptions = {sourceMaps: true, config: {sourceRoot: paths.tmp.scripts}};

  builder.loadConfig('./jspm.config.js')
    .then(function () {
      builder.buildSFX(inputPath, outputFile, outputOptions)
        .then(function () {
          return cb();
        })
        .catch(function (ex) {
          cb(new Error(ex));
        });
    });
});