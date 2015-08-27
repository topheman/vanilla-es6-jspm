'use strict';

/**
 * This helper will listen to DOM changes and fire the callback
 * It is based on DOM3 MutationObserver
 *
 * For PhantomJS and other browser which don't support it a shim is installed : https://github.com/megawac/MutationObserver.js/tree/master
 *
 * More infos on https://developer.mozilla.org/fr/docs/Web/API/MutationObserver
 *
 * @param {HTMLElement} DOMNode
 * @param {function} callback
 */
export function onDOMElementChange(DOMNode, callback) {
  // select the target node
  var target = DOMNode;

  // create an observer instance
  var observer = new MutationObserver((mutations) => {
    // don't bother about finding what changed
    // if something changed -> fire the callback
    if(mutations.length > 0){
      // stop observing before launching callback
      observer.disconnect();
      callback();
    }
  });

  // configuration of the observer:
  var config = { attributes: true, childList: true, characterData: true };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);
}
