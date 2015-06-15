'use strict';

//inspired by the gulpfile.js from https://github.com/martinmicunda/employee-scheduling-ui

/**
 * Load required dependencies.
 */
var pkg = require('./package.json');
var gulp = require('gulp');
var modRewrite = require('connect-modrewrite');
var browserSync = require('browser-sync');

/**
 * Load Gulp plugins listed in 'package.json' and attaches
 * them to the `$` variable.
 */
var $ = require('gulp-load-plugins')();

//=============================================
//            UTILS FUNCTIONS
//=============================================

/*var proxyTarget = 'http://localhost:9000/';
 var proxyApiPrefix = 'api';
 var proxy = httpProxy.createProxyServer({
 target: proxyTarget
 });

 var proxyMiddleware = function(req, res, next) {
 if (req.url.indexOf(proxyApiPrefix) !== -1) {
 proxy.web(req, res);
 } else {
 next();
 }
 };*/

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
//            DECLARE PATHS
//=============================================

var paths = {
  gulpfile: 'gulpfile.js',
  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks.
   *
   * - 'styles'       contains all project css styles
   * - 'images'       contains all project images
   * - 'fonts'        contains all project fonts
   * - 'scripts'      contains all project javascript except config-env.js and unit test files
   * - 'html'         contains main html files
   * - 'templates'    contains all project html templates
   * - 'config'       contains Angular app config files - @todo not sure for the moment
   */
  app: {
    basePath: 'src/',
    fonts: [
      'src/fonts/**/*.{eot,svg,ttf,woff}',
      'jspm_packages/**/*.{eot,svg,ttf,woff}'
    ],
    styles: 'src/styles/**/*.scss',
    images: 'src/images/**/*.{png,gif,jpg,jpeg}',
    scripts: [
      'src/app/**/*.js',
      '!src/app/**/*.spec.js'
    ],
    html: 'src/index.html',
    templates: 'src/app/**/*.html'
  },
  /**
   * The 'tmp' folder is where our html templates are compiled to JavaScript during
   * the build process and then they are concatenating with all other js files and
   * copy to 'dist' folder.
   */
  tmp: {
    basePath: '.tmp/',
    styles: '.tmp/styles/',
    scripts: '.tmp/scripts/'
  }
};

//=============================================
//               SUB TASKS
//=============================================

/**
 * The 'jshint' task defines the rules of our hinter as well as which files
 * we should check. It helps to detect errors and potential problems in our
 * JavaScript code.
 */
gulp.task('jshint', function () {
  return gulp.src(paths.app.scripts.concat(paths.gulpfile))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

/**
 * Compile SASS files into the main.css.
 * @todo
 */
gulp.task('sass', function () {
  console.log('TODO sass');
});

/**
 * The 'watch' task set up the checks to see if any of the files listed below
 * change, and then to execute the listed tasks when they do.
 * @todo
 */
gulp.task('watch', function () {
  console.log('TODO watch');
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