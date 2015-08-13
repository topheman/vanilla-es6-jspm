'use strict';

import gulp from 'gulp';
import htmlhint from 'gulp-htmlhint';
import paths from '../paths';

/**
 * Returns a htmlhint gulp task according to the env
 * @param {String} env "dev"|"test"
 * @returns {*}
 */
function generateHtmlhintTask(env) {
  var src;
  switch (env.toLowerCase()) {
    case 'test':
      src = [].concat(paths.app.html, paths.app.templates, paths.test.unit.fixtures);
      break;
    default: //(dev)
      src = [].concat(paths.app.html, paths.app.templates);
      break;
  }
  return gulp.src(src)
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter())
    .pipe(htmlhint.failReporter());
}

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
  return generateHtmlhintTask('dev');
});
gulp.task('htmlhint:test', () => {
  return generateHtmlhintTask('test');
});
