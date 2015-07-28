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

//=============================================
//                MAIN TASKS
//=============================================

//---------------------------------------------
//              DEVELOPMENT TASKS
//---------------------------------------------


gulp.task('default', ['serve']);