import Component from '../Component/Component';

import template from './Geolocation.html!text';

import geoip from '../../services/geolocation/geolocation';

export default class Geolocation extends Component {
  constructor(domNode){
    super(domNode, template);
  }
  init(){
    this.domNode.querySelector('.geolocation-button').addEventListener('click',() => {
      geoip().then((result) => {
        console.log(result);
        let tpl = `
          <li>City: ${result.city}</li>
          <li>Country: ${result.country_name}</li>
          <li>Region: ${result.region_name}</li>
          <li>Time zone: ${result.time_zone}</li>
          <li>Region: ${result.region_name}</li>
          <li>Latitude : ${result.latitude} / Longitude: ${result.longitude}</li>
        `
        this.domNode.querySelector('.geolocation-infos').innerHTML = tpl;
      })
    }, false);
    return this;
  }
}