require('babel/register');//write test in es6
var SpecReporter = require('jasmine-spec-reporter');

var config = {
  framework: 'jasmine2',
  specs: [
    'test/e2e/spec/**/*.spec.js'
  ],
  onPrepare: function(){
    global.isAngularSite = function(flag){
      browser.ignoreSynchronization = !flag;
    };
    jasmine.getEnv().addReporter(new SpecReporter());
  }
}

module.exports.config = exports.config = config;
