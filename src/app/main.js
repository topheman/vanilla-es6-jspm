import Geolocation from './components/Geolocation/Geolocation.js';

export default class main {
  static init(){
    this.initGeolocation();
  }
  static initGeolocation(){
    (new Geolocation('geolocation')).init();
  }
}