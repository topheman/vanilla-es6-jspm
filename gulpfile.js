'use strict';

//inspired by the gulpfile.js from https://github.com/martinmicunda/employee-scheduling-ui

/**
 * Load required dependencies.
 */
var pkg            = require('./package.json');
var gulp           = require('gulp');
var modRewrite     = require('connect-modrewrite');
var browserSync    = require('browser-sync');

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
//               SUB TASKS
//=============================================

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
})

//=============================================
//                MAIN TASKS
//=============================================

//---------------------------------------------
//              DEVELOPMENT TASKS
//---------------------------------------------

/**
 * The 'serve' task serve the dev environment.
 */
gulp.task('serve', ['sass', 'watch'], function() {
  startBrowserSync(['.tmp', 'src', 'jspm_packages', './' ]);
});
gulp.task('default', ['serve']);