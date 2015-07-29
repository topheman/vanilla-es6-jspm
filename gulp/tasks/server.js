'use strict';

import gulp from 'gulp';
import util from 'gulp-util';
import modRewrite  from 'connect-modrewrite';
import browserSync from 'browser-sync';

import path from '../paths';

//=============================================
//            PROXY CONFIGURATION
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
//                 TASKS
//=============================================

/**
 * The 'serve' task serve the dev environment.
 */
gulp.task('serve', ['sass', 'watch'], () => {
  startBrowserSync(['.tmp', 'src', 'jspm_packages', './']);
});