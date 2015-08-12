var jspmOverride = require('./test/unit/jspm.override.json');

module.exports = function (config) {
  'use strict';
  config.set({

    //basePath: '',//don't override basePath, use proxies

    frameworks: ['jspm', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [],

    //@todo import more than just "paths" from jspmOverride ?
    jspm: {
      config: 'jspm.config.js',
      loadFiles: [
        'node_modules/phantomjs-polyfill/bind-polyfill.js',//necessary for PhantomJS (doesn't have Function.bind)
        'test/unit/spec/**/*.js'
      ],
      serveFiles: [
        'src/app/**/*.js',
        'src/app/**/*.html',
        'src/app/**/*.css',
        'test/unit/stubs/**/*'
      ],
      paths: jspmOverride.paths
    },

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
