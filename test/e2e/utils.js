/**
 * When you use protractor in a non angular way, you have to tell it not to wait
 * To do that, in the protractor.config, on the onPrepare, a global method is exposed: isAngularSite
 * It switches on/off the browser.ignoreSynchronization flag
 * You have to do that for each beforeEach.
 *
 * This utility is here to simplify the boilerplate.
 *
 * If you are on angular, you can use the regular beforeEach
 *
 * If you are not, you can use this one, simply giving the false flag in first argument
 * You still can pass your own beforeEach function
 *
 * Example: beforeEachIsAngular(false) or beforeEachIsAngular(false, () => { console.log('toto'); })
 * @param args
 * @returns {*}
 */
export function beforeEachIsAngular(...args) {
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
