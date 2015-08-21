'use strict';

import gulp from 'gulp';
import util from 'gulp-util';
import modRewrite  from 'connect-modrewrite';
import browserSync from 'browser-sync';

import jspmOverride from '../../test/jspm.override.json';

import {COLORS,LOG} from '../utils.js';

import {DEFAULT_SERVER_PORT} from '../const.js';
import path from '../paths';

//launch your task with `--port 9002` for example
var serverPort = util.env.port;

function infos(env) {
  LOG(COLORS.yellow('[INFOS] call `gulp serve:' + env + ' --port 9002` (for example) to launch on another port'));
  LOG(COLORS.yellow('[INFOS] call `gulp serve:' + env + ' --disable-watch` if you don\'t need it'));
}

//=============================================
//            PROXY CONFIGURATION
//=============================================

/**
 * Launches a browserSync server
 * Injecting `env` as a global variable + overriding jspm.config.js if in test
 * @param env dev/test/prod
 * @param baseDir
 * @param [options]
 * @param [options.files='default']
 * @param [options.browser='default']
 * @param [options.port=DEFAULT_SERVER_PORT]
 */
function startBrowserSync(env, baseDir, options = {}) {
  env = env.toLowerCase();
  options.browser = options.browser === undefined ? 'default' : options.browser;
  options.files = options.files === undefined ? 'default' : options.files;
  options.port = options.port === undefined ? DEFAULT_SERVER_PORT : options.port;

  var config = {
    files: options.files,
    port: options.port,
    notify: false,
    server: {
      baseDir: baseDir,
      middleware: [
        //proxyMiddleware,
        modRewrite(['!\\.\\w+$ /index.html [L]']), // require for HTML5 mode
        function (req, res, next) {
          //don't cache the entry point (since there are some inline <script> tags injected that can be different according to the env you launch it)
          if (req.url.indexOf('/index.html') > -1) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
            res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
            res.setHeader("Expires", "0"); // Proxies.
          }
          next();
        }
      ]
    },
    browser: options.browser
  };

  /**
   * Replace the tag <!-- inject-browser-sync --> with some specific js code
   * injecting what we need (env var, jspm.config override ...)
   *
   * Also adds the `test/fixtures/bs.snippet.html`file in test mode
   *
   * Only used on dev and test
   */
  if (env.toLowerCase() !== 'prod') {
    var injectBrowserSync = [];
    var bsHtmlSnippet = '';
    injectBrowserSync.push('<script id="inject-browser-sync">');
    injectBrowserSync.push('window.env = "' + env + '";');
    injectBrowserSync.push('console.info("Launched in ' + env + ' mode");');
    switch (env) {
      case 'test':
        injectBrowserSync.push('console.warn("Overriding jspm.config.js");');
        injectBrowserSync.push('System.config(' + JSON.stringify(jspmOverride) + ');');
        injectBrowserSync.push('console.info("Using following System.paths",System.paths);');
        bsHtmlSnippet = require('fs').readFileSync(__dirname + '/../../test/fixtures/bs.snippet.html');
        break;
    }
    injectBrowserSync.push('</script>');
    injectBrowserSync.push(bsHtmlSnippet);
    injectBrowserSync = injectBrowserSync.join('\n');
    config.rewriteRules = [
      {
        match: /<!-- inject-browser-sync -->/g,
        fn: function (match) {
          return injectBrowserSync;
        }
      }
    ];
  }

  browserSync(config);
}

//=============================================
//                 TASKS
//=============================================

/**
 * The 'serve' task serve the dev environment.
 */
gulp.task('serve:dev', ['sass', 'watch:dev'], () => {
  infos('dev');
  startBrowserSync('dev', ['.tmp', 'src', 'jspm_packages', './'], {port: serverPort});
});
gulp.task('serve', ['serve:dev']);

/**
 * The 'serve' task adding the overrides to the jspm configuration for mocks and stubs
 *
 * This is for dev purpose of the tests. Launch the tests with `npm test` or `npm test-unit`
 */
gulp.task('serve:test', ['sass', 'watch:test'], () => {
  infos('test');
  startBrowserSync('test', ['.tmp', 'src', 'jspm_packages', './'], {port: serverPort});
});

/**
 * The 'serve' task serve the prod environment (you need to build before)
 */
gulp.task('serve:prod', () => {
  infos('prod');
  startBrowserSync('prod', ['./build/dist'], {port: serverPort});
});
