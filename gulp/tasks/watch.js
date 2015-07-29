'use strict';

import gulp from 'gulp';
import browserSync from 'browser-sync';

import paths from '../paths';

/**
 * The 'watch' task set up the checks to see if any of the files listed below
 * change, and then to execute the listed tasks when they do.
 */
gulp.task('watch', () => {
  // Watch images and fonts files
  gulp.watch([paths.app.images, paths.app.fonts], [browserSync.reload]);

  // Watch css files
  gulp.watch(paths.app.styles, ['sass']);

  // Watch js files
  gulp.watch([paths.app.scripts, paths.gulpfile], ['jshint', browserSync.reload]);

  // Watch html files
  gulp.watch([paths.app.html, paths.app.templates], ['htmlhint', browserSync.reload]);
});