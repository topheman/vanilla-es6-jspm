var jspmOverride = require('./test/jspm.override.json');
var _ = require('lodash');

/**
 * karma-jspm passes this config to jspm via karma
 * It contains some karma-jspm specific attributes such as config, loadFiles, serveFiles
 * It can also accept any jspm configuration you'd like to overload, such as paths or map
 *
 * The `test/jspm.override.json` file (containing the systemjs config for test used in `gulp serve:test`)
 * will be merged into the following karmaJspmConfig.
 *
 * This way, the file `test/jspm.override.json` is shared between karma and gulp.
 */
var karmaJspmConfig = {
  config: 'jspm.config.js',
  loadFiles: [
    'node_modules/phantomjs-polyfill/bind-polyfill.js',//necessary for PhantomJS (doesn't have Function.bind)
    'test/unit/spec/**/*.js'
  ],
  serveFiles: [
    'src/app/**/*.js',
    'src/app/**/*.html',
    'src/app/**/*.css',
    'test/stubs/**/*'
  ]
};
//merging the config
karmaJspmConfig = _.assign(karmaJspmConfig, jspmOverride);

module.exports = function (config) {
  'use strict';
  config.set({

    //basePath: '',//don't override basePath, use proxies

    frameworks: ['jspm', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [],

    // specific karma-jspm config (with the merged configs from `test/jspm.override.json`)
    jspm: karmaJspmConfig,

    proxies: {
      '/src/': '/base/src/',
      '/test/': '/base/test/',
      '/jspm_packages/': '/base/jspm_packages/',
      '/node_modules/phantomjs-polyfill/': '/base/node_modules/phantomjs-polyfill/'
    },

    reporters: ['spec'],

    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    browsers: ['PhantomJS'],

    plugins: [
      'karma-jspm',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-spec-reporter'
    ]

  });
};
