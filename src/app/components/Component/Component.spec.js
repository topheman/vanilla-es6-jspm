'use strict';

import Component from './Component.js';

describe('ES6 Component', function () {

  let component;
  let htmlElement;

  beforeEach(()=>{
    htmlElement = document.createElement('div');
    component = new Component(htmlElement);
  });

  it('.init method should be defined', ()=>{
    expect(component.init).to.not.be.an('undefined');
  });
  it('should fail', () => {
    expect(true).to.be.false;
  });
});