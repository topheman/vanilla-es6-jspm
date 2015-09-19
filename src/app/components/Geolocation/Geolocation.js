/**
 * @module src/app
 */
import Component from '../Component/Component.js';
import Spinner from '../Spinner/Spinner.js';

import template from './Geolocation.html!text';

import {geolocation} from 'services/geolocation/geolocation.js';

export default class Geolocation extends Component {
  /**
   * Creates a full Geolocation component with its whole logic encapsulated:
   *
   * * button to launch a geolocation request
   * * spinner while requesting (based on {{#crossLink "Spinner"}}Spinner{{/crossLink}})
   * * display of the result
   *
   * Example:
   *
   * ```
   * var myGeolocation = (new Geolocation('geolocation')).init();
   * ```
   * @namespace components.Geolocation
   * @class Geolocation
   * @extends components.Component.Component
   * @constructor
   * @param {HTMLElement|String} domNode Can be an domNode or a domNode id
   */
  constructor(domNode) {
    super(domNode, template);
  }

  /**
   * Inits the Geolocation component, adding all its specific logic.
   * @method init
   * @chainable
   * @return {components.Geolocation.Geolocation}
   */
  init() {
    this.spinner = (new Spinner(this.domNode.querySelector('.spinner'))).init().hide();

    let geolocationInfosBloc = this.domNode.querySelector('.geolocation-infos');

    this.domNode.querySelector('.geolocation-button').addEventListener('click', () => {
      geolocationInfosBloc.style.display = "none";
      this.spinner.show();
      geolocation()
        .then((result) => {
          console.log(result);
          let tpl = `
          <li>City: ${result.city}</li>
          <li>Country: ${result.country_name}</li>
          <li>Region: ${result.region_name}</li>
          <li>Time zone: ${result.time_zone}</li>
          <li>Region: ${result.region_name}</li>
          <li>Latitude : ${result.latitude} / Longitude: ${result.longitude}</li>
          <li>Timeout : ${result.timeout}ms</li>
        `;
          this.spinner.hide();
          geolocationInfosBloc.style.display = "block";
          geolocationInfosBloc.innerHTML = tpl;
        })
        .catch(e => {
          console.error(e);
          geolocationInfosBloc.innerHTML = '<li>An error occured</li>';
          this.spinner.hide();
          geolocationInfosBloc.style.display = "block";
        });
    }, false);
    return this;
  }
}
