//import bootstrap from 'bootstrap';
//import $ from 'jquery';

import 'fetch-polyfill';

import main from './main.js';

export default class Bootstrap {
  static init() {
    console.log('Bootstrap.init !!!');
    main.init();
  }
}

Bootstrap.init();
