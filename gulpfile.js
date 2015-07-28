'use strict';

//inspired by the gulpfile.js from https://github.com/martinmicunda/employee-scheduling-ui

//use babel transpiler for ES6 files in node without needing --harmony nor a gulpfile.babel.js
require('babel/register');

// require all tasks
require('require-dir')('./gulp/tasks', { recurse: true });

/**
 * Load required dependencies.
 */
var pkg = require('./package.json');
var del = require('del');
var gulp = require('gulp');
var modRewrite = require('connect-modrewrite');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var paths = require('./gulp/paths');

/**
 * Load Gulp plugins listed in 'package.json' and attaches
 * them to the `$` variable.
 */
var $ = require('gulp-load-plugins')();

//=============================================
//            DECLARE VARIABLES
//=============================================

var log = $.util.log;
var argv = $.util.env;
var ENV = !!argv.env ? argv.env : 'dev';
var COLORS = $.util.colors;

//=============================================
//            UTILS FUNCTIONS
//=============================================

function startBrowserSync(baseDir, files, browser) {
  browser = browser === undefined ? 'default' : browser;
  files = files === undefined ? 'default' : files;

  browserSync({
    files: files,
    port: 9000,
    notify: false,
    server: {
      baseDir: baseDir,
      middleware: [
        //proxyMiddleware,
        modRewrite(['!\\.\\w+$ /index.html [L]']) // require for HTML5 mode
      ]
    },
    browser: browser
  });
}

//=============================================
//               SUB TASKS
//=============================================

/**
 * The 'htmlhint' task defines the rules of our hinter as well as which files we
 * should check. It helps to detect errors and potential problems in our
 * HTML code.
 * @todo
 */
gulp.task('htmlhint', function () {
  process.stdout.write('TODO htmlhint\n');
});

/**
 * The 'watch' task set up the checks to see if any of the files listed below
 * change, and then to execute the listed tasks when they do.
 */
gulp.task('watch', function () {
  // Watch images and fonts files
  gulp.watch([paths.app.assets.images, paths.app.assets.fonts], [browserSync.reload]);

  // Watch css files
  gulp.watch(paths.app.styles, ['sass']);

  // Watch js files
  gulp.watch([paths.app.scripts, paths.gulpfile], ['jshint', browserSync.reload]);

  // Watch html files
  gulp.watch([paths.app.html, paths.app.templates], ['htmlhint', browserSync.reload]);
});

//=============================================
//                MAIN TASKS
//=============================================

//---------------------------------------------
//              DEVELOPMENT TASKS
//---------------------------------------------

/**
 * The 'serve' task serve the dev environment.
 */
gulp.task('serve', ['sass', 'watch'], function () {
  startBrowserSync(['.tmp', 'src', 'jspm_packages', './']);
});
gulp.task('default', ['serve']);