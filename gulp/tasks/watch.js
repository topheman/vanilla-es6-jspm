'use strict';

import gulp from 'gulp';
import util from 'gulp-util';
import browserSync from 'browser-sync';

import {COLORS,LOG,ENV} from '../utils.js';

import paths from '../paths';

import {DISABLE_WATCH} from '../utils.js';

/**
 * The 'watch' task set up the checks to see if any of the files listed below
 * change, and then to execute the listed tasks when they do.
 *
 * According to the env it's launched to, it won't watch the same files (in test, will watch more files)
 */
gulp.task('watch', () => {
  if (DISABLE_WATCH) {
    LOG(COLORS.yellow('[INFOS] watch is disabled'));
    return;
  }
  // Watch images and fonts files
  gulp.watch([paths.app.images, paths.app.fonts], [browserSync.reload]);

  // Watch css files
  gulp.watch(paths.app.styles, ['sass', browserSync.reload]);//if takes to long, take a look at https://github.com/Browsersync/recipes/tree/master/recipes/gulp.task.sequence

  // Create the html list of file to watch according to env
  if (ENV !== 'dist') {
    var htmlFileList;
    switch (ENV) {
      case 'test':
        htmlFileList = [].concat(paths.app.html, paths.app.templates, paths.test.fixtures);
        break;
      case 'dev':
        htmlFileList = [].concat(paths.app.html, paths.app.templates);
        break;
    }

    // Create the js list of file to watch according to env
    var jsFileList;
    switch (ENV) {
      case 'test':
        jsFileList = [].concat(paths.app.scripts, paths.gulpfile, paths.config.karma, paths.config.e2e, paths.test.stubs, paths.test.unit, paths.test.e2e);
        break;
      case 'dev':
        jsFileList = [].concat(paths.app.scripts, paths.gulpfile);
        break;
    }

    // Watch html files
    gulp.watch(htmlFileList, ['htmlhint', browserSync.reload]);

    // Watch js files
    gulp.watch(jsFileList, ['jshint', browserSync.reload]);
  }
});
