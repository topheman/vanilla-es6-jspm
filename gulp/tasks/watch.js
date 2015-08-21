'use strict';

import gulp from 'gulp';
import util from 'gulp-util';
import browserSync from 'browser-sync';

import {COLORS,LOG} from '../utils.js';

import paths from '../paths';

//launch your task with `--disable-watch` for example
var disableWatch = util.env['disable-watch'];

function setupBasicGulpWatch() {
  // Watch images and fonts files
  gulp.watch([paths.app.images, paths.app.fonts], [browserSync.reload]);

  // Watch css files
  return gulp.watch(paths.app.styles, ['sass', browserSync.reload]);//if takes to long, take a look at https://github.com/Browsersync/recipes/tree/master/recipes/gulp.task.sequence
}

function getGulpWatchJs(env = 'dev') {
  var src;
  switch (env.toLowerCase()) {
    case 'test':
      src = [].concat(paths.app.scripts, paths.gulpfile, paths.test.stubs.scripts, paths.test.unit.spec);
      break;
    default:
      src = [].concat(paths.app.scripts, paths.gulpfile);
      break;
  }
  return gulp.watch(src, ['jshint:' + env, browserSync.reload]);
}

function getGulpWatchHtml(env = 'dev') {
  var src;
  switch (env.toLowerCase()) {
    case 'test':
      src = [].concat(paths.app.html, paths.app.templates, paths.test.unit.fixtures);
      break;
    default:
      src = [].concat(paths.app.html, paths.app.templates);
      break;
  }
  return gulp.watch(src, ['jshint:' + env, browserSync.reload]);
}

/**
 * The 'watch' task set up the checks to see if any of the files listed below
 * change, and then to execute the listed tasks when they do.
 *
 * According to the env it's launched to, it won't watch the same files (in test, will watch more files)
 */
gulp.task('watch:dev', () => {
  if(disableWatch){
    LOG(COLORS.yellow('[INFOS] watch is disabled'));
    return;
  }
  setupBasicGulpWatch();
  getGulpWatchJs('dev');
  getGulpWatchHtml('dev');
});
gulp.task('watch:test', () => {
  if(disableWatch){
    LOG(COLORS.yellow('[INFOS] watch is disabled'));
    return;
  }
  setupBasicGulpWatch();
  getGulpWatchJs('test');
  getGulpWatchHtml('test');
});
gulp.task('watch', ['watch:dev']);
