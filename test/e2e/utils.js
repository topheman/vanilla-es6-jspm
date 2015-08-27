'use strict';

/**
 * When you use protractor in a non angular way, you have to tell it not to wait
 * by specifying browser.ignoreSynchronization = false in the onPrepare of the protractor config.
 *
 * If you have a website completly angular or completly non-angular, just use the config.isAngular in package.json
 *
 * If you want to be able to switch the behavior of protractor, use the following helper:
 * - in the protractor config, a global method is exposed: isAngularSite
 * - this method switches on/off the browser.ignoreSynchronization flag
 * You have to do that for each beforeEach.
 *
 * This utility is here to simplify the boilerplate.
 *
 * Example: beforeEachIsAngular(false) or beforeEachIsAngular(false, () => { console.log('toto'); })
 * @param args
 * @returns {*}
 */
export function beforeEachIsAngular(...args) {
  /* jshint undef: false, unused: true */
  // case with beforeEachIsAngular(() => {}, false);
  if(typeof args[1] === 'function' && typeof args[0] === 'boolean'){
    return beforeEach(() => {
      isAngularSite(args[0]);
      args[1]();
    });
  }
  // case with beforeEachIsAngular(() => {});
  else if (typeof args[0] === 'function') {
    return beforeEach(args[0]);
  }
  // case with beforeEachIsAngular(false);
  else if (typeof args[0] === 'boolean'){
    return beforeEach(() => {
      isAngularSite(args[0]);
    });
  }
  else{
    throw new Error('beforeEachIsAngular: wrong parameters - (boolean, fn) or (fn) or (boolean)');
  }
}
