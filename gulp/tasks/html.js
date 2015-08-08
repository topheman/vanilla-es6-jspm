'use strict';

import gulp from 'gulp';
import htmlhint from 'gulp-htmlhint';
import paths from '../paths';

/**
 * The 'htmlhint' task defines the rules of our hinter as well as which files we
 * should check. It helps to detect errors and potential problems in our
 * HTML code.
 *
 * @return {Stream}
 */
gulp.task('htmlhint', () => {
  return gulp.src([paths.app.html, paths.app.templates])
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter())
    .pipe(htmlhint.failReporter());
});
