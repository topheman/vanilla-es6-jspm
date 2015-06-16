import template from './Geolocation.html!text';
import geoip from '../../services/geolocation/geolocation';

export default class Geolocation {
  constructor(domNode){
    if(typeof domNode === 'string'){
      let nodeId = domNode;
      domNode = document.getElementById(domNode);
      if(domNode === null){
        throw new Error(`No element found under #${nodeId}`);
      }
    }
    if(domNode instanceof HTMLElement){
      this.domNode = domNode;
      this.domNode.innerHTML = template;
    }
    else{
      throw new Error('Invalid param, must be an HTMLElement or a string of the id of one');
    }
  }
  init(){
    this.domNode.querySelector('.geolocation-button').addEventListener('click',function(){
      geoip().then(function(result){
        console.log(result);
      })
    }, false);
    return this;
  }
}