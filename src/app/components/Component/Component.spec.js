'use strict';

import {expect} from 'chai';

import Component from './Component.js';

describe('ES6 Component', function () {

  let component;
  let htmlElement;

  beforeEach(()=>{
    htmlElement = document.createElement('div');
    component = new Component(htmlElement);
  });

  it('should return Do Something when calling doSomething', ()=>{
    expect(component.init).to.not.be.an('undefined');
  });
});