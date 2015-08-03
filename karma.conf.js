module.exports = function (config) {
  'use strict';
  config.set({

    //basePath: '../'+__dirname,
    basePath: 'base',

    frameworks: ['jspm','mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: [
    ],

    jspm: {
      config: 'jspm.config.js',
      loadFiles: ['src/**/*.spec.js'],
      serveFiles: ['src/app/**/*.{js,html,css,json}']
    },

    proxies: {
      '/base/src/': '/src/',
      '/base/jspm_packages/': '/jspm_packages/'
    },

    reporters: ['progress'],

    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: false,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    browsers: ['Chrome'],

    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-jspm',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-phantomjs-launcher'
    ]

  });
};