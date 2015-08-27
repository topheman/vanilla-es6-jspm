'use strict';

import Geolocation from 'components/Geolocation/Geolocation.js';

describe('components/Component/Geolocation.js', () => {

  const WRAPPER_ID = 'simple-wrapper';
  var geolocationComponent = null;

  /**
   * Inject a simple fixture before each test
   */
  beforeEach(() => {
    document.body.innerHTML = window.__html__['test/fixtures/components/simple-wrapper.html'];
  });
  afterEach(() => {
    document.body.innerHTML = null;
    geolocationComponent = null;
  });

  describe('DOM testing - component init', () => {

    it('should import the html fixture to the DOM', () => {
      expect(document.getElementById(WRAPPER_ID)).toBeDefined();
    });

    it('component should init from html id', () => {
      geolocationComponent = (new Geolocation(WRAPPER_ID)).init();
      expect(document.querySelector('.panel-heading').innerHTML).toEqual('Geolocation example');
    });

    it('component should init from html node', () => {
      var node = document.getElementById(WRAPPER_ID);
      geolocationComponent = (new Geolocation(node)).init();
      expect(document.querySelector('.panel-heading').innerHTML).toEqual('Geolocation example');
    });

    it('click on button should show spinner while waiting', () => {
      geolocationComponent = (new Geolocation(WRAPPER_ID)).init();
      document.querySelector('button.geolocation-button').click();
      expect(document.querySelector('.spinner').style.display).toEqual('block');
    });

  });

  /**
   * Inject a simple fixture + init the component before each test
   */
  beforeEach(() => {
    document.body.innerHTML = window.__html__['test/fixtures/components/simple-wrapper.html'];
    geolocationComponent = (new Geolocation(WRAPPER_ID)).init();
  });
  afterEach(() => {
    document.body.innerHTML = null;
    geolocationComponent = null;
  });
  describe('DOM testing - click button [more e2e]', () => {

    it('should hide spinner when results ready', (done) => {
      document.querySelector('button.geolocation-button').click();
      setTimeout(() => {
        expect(document.querySelector('.spinner').style.display).toEqual('none');
        done();
      },50);//sad but PhantomJS friendly ...
    });

    it('should show results when ready', (done) => {
      document.querySelector('button.geolocation-button').click();
      setTimeout(() => {
        expect(document.querySelector('ul.geolocation-infos li').innerHTML).toEqual('City: Hello World !!!');
        done();
      },50);//sad but PhantomJS friendly ...
    });

  });

});
