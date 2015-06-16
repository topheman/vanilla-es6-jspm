import Geolocation from './components/Geolocation/Geolocation';

export default class main {
  static init(){
    this.initGeolocation();
  }
  static initGeolocation(){
    (new Geolocation('geolocation')).init();
  }
}