'use strict';

require('babel/register');//write test in es6
var SpecReporter = require('jasmine-spec-reporter');
var pkg = require('./package.json');

/**
 * This constant is retrieved from the package.json in the `config.isAngular`
 * That way, you can specify globally if the site is Anuglar or not
 */
var IS_ANGULAR = (pkg.config ? (pkg.config.isAngular ? pkg.config.isAngular : false) : false);

/**
 * The default port on which the test will be run is the one specified in package.json under config.port
 *
 * To overload this port, just pass the flag --port
 *
 * Use the global goToUrl(relativeUrl) helper (which will use what ever port you defined)
 *
 */
var argv = require('minimist')(process.argv.slice(2));
var PORT = argv.port || (pkg.config ? (pkg.config.port ? pkg.config.port : null) : null) || 9000;
var BASE_URL = argv['base-url'] || 'http://localhost';
var WITH_DOCS = argv['with-docs'] || process.env.WITH_DOCS;
console.log('[INFOS] Testing on ' + BASE_URL + ':' + PORT);

var specs = [
  'test/e2e/spec/**/*.spec.js'
];

if(WITH_DOCS){
  console.log('[INFOS] Running in --with-docs mode (will run the test that will check for /docs to make sure they were correctly generated)');
  specs.push('test/e2e/spec/docs.specs.conditional.js');
}

var config = {
  framework: 'jasmine2',
  specs: specs,
  chromeDriver: './node_modules/chromedriver/lib/chromedriver/chromedriver',
  onPrepare: function () {
    browser.ignoreSynchronization = !IS_ANGULAR;
    /**
     * Set on/off angular synchronisation of protractor
     * Use the beforeEachIsAngular helper in `test/e2e/utils.js`
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

if (process.env.TRAVIS) {
  config.sauceUser = process.env.SAUCE_USERNAME;
  config.sauceKey = process.env.SAUCE_ACCESS_KEY;
  config.capabilities = {
    'name': 'vanilla-es6-jspm E2E node v' + process.env.TRAVIS_NODE_VERSION,
    'browserName': 'chrome',
    'seleniumVersion': '2.48.2',
    'chromedriverVersion': '2.20',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER
  };
}

module.exports.config = exports.config = config;
