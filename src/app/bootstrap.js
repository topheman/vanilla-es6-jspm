//import bootstrap from 'bootstrap';
//import $ from 'jquery';

import main from './main.js';

export default class Bootstrap {
  static init(){
    console.log('Bootstrap.init !!!');
    main.init();
  }
}

Bootstrap.init();