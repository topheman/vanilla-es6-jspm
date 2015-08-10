'use strict';

import gulp from 'gulp';
import util from 'gulp-util';
import modRewrite  from 'connect-modrewrite';
import browserSync from 'browser-sync';

import path from '../paths';

//=============================================
//            PROXY CONFIGURATION
//=============================================

/**
 * Launches a browserSync server
 * Injecting `env` as a global variable + overriding jspm.config.js if in test
 * @param env dev/test/prod
 * @param baseDir
 * @param files
 * @param browser
 */
function startBrowserSync(env, baseDir, files, browser) {
  env = env.toLowerCase();
  browser = browser === undefined ? 'default' : browser;
  files = files === undefined ? 'default' : files;

  var config = {
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
  };

  /**
   * Replace the tag <!-- inject-browser-sync --> with some specific js code
   * injecting what we need (env var, jspm.config override ...)
   */
  var injectBrowserSync = [];
  injectBrowserSync.push('window.env = "' + env + '";');
  injectBrowserSync.push('console.log("Launch in ' + env + ' mode");');
  switch (env) {
    case 'test':
      injectBrowserSync.push('console.warn("Overriding jspm.config.js");');//@todo inject the jspm.config override
      break;
  }
  injectBrowserSync = '<script id="inject-browser-sync">' + injectBrowserSync.join('') + '</script>';
  config.rewriteRules = [
    {
      match: /<!-- inject-browser-sync -->/g,
      fn: function (match) {
        return injectBrowserSync;
      }
    }
  ];

  browserSync(config);
}

//=============================================
//                 TASKS
//=============================================

/**
 * The 'serve' task serve the dev environment.
 */
gulp.task('serve', ['sass', 'watch'], () => {
  startBrowserSync('dev', ['.tmp', 'src', 'jspm_packages', './']);
});
