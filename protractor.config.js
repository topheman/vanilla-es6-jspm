'use strict';

require('babel/register');//write test in es6
var SpecReporter = require('jasmine-spec-reporter');

/**
 * The default port on which the test will be run is the one specified in package.json under config.port
 *
 * To overload this port, just pass the flag --port
 *
 * Use the global goToUrl(relativeUrl) helper (which will use what ever port you defined)
 *
 */
var argv = require('minimist')(process.argv.slice(2));
var PORT = argv.port || process.env.npm_package_config_port || 9000;
var BASE_URL = argv['base-url'] || 'http://localhost';
console.log('[INFOS] Testing on ' + BASE_URL + ':' + PORT);

var config = {
  framework: 'jasmine2',
  specs: [
    'test/e2e/spec/**/*.spec.js'
  ],
  onPrepare: function () {
    /**
     * Set on/off angular synchronisation of protractor
     * @param flag
     */
    global.isAngularSite = function (flag) {
      browser.ignoreSynchronization = !flag;
    };
    /**
     * Helper to use instead of directly `browser.get` so that you don't bother about the port
     * baseUrl and port are optional and can be overriden globally when launching protractor
     * with the flags --base-url and --port
     * @param relativeUrl
     * @param baseUrl
     * @param port
     */
    global.goToUrl = function (relativeUrl, baseUrl, port) {
      baseUrl = typeof baseUrl === 'undefined' ? BASE_URL : baseUrl;
      port = typeof port === 'undefined' ? PORT : port;
      browser.get(baseUrl + ':' + port + relativeUrl);
    };
    jasmine.getEnv().addReporter(new SpecReporter());
  }
};

module.exports.config = exports.config = config;
