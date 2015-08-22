'use strict';

import gulp from 'gulp';
import htmlhint from 'gulp-htmlhint';
import paths from '../paths';
import {ENV} from '../utils.js';

/**
 * The 'htmlhint' task defines the rules of our hinter as well as which files we
 * should check. It helps to detect errors and potential problems in our
 * HTML code.
 *
 * Can also be executed in test env, like the jshint task
 *
 * @return {Stream}
 */
gulp.task('htmlhint', () => {
  var src;
  switch (ENV) {
    case 'test':
      src = [].concat(paths.app.html, paths.app.templates, paths.test.fixtures);
      break;
    case 'dev':
    default:
      src = [].concat(paths.app.html, paths.app.templates);
      break;
  }
  return gulp.src(src)
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter())
    .pipe(htmlhint.failReporter());
});
