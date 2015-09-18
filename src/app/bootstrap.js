/**
 * @module src/app
 */

//import bootstrap from 'bootstrap';
//import $ from 'jquery';

import 'fetch-polyfill';

import main from './main.js';

/**
 * This is the entry point of the whole application.
 *
 * Example:
 *
 * ```
 * System.import('app/bootstrap.js').catch(console.error.bind(console));
 * ```
 * @class bootstrap
 * @main src/app
 */
export default class bootstrap {
  /**
   * Launches the whole app.
   * @method init
   * @static
   */
  static init() {
    console.log('bootstrap.init !!!');
    main.init();
  }
}

bootstrap.init();
