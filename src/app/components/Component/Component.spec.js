'use strict';

import Component from './Component.js';

describe('components/Component/Component.js', function () {

  let component;
  let htmlElement;

  beforeEach(()=>{
    htmlElement = document.createElement('div');
    component = new Component(htmlElement);
  });

  it('.init method should be defined', ()=>{
    expect(component.init).to.not.be.an('undefined');
  });
  it('.init() should return this', () => {
    expect(component.init()).to.be.an.instanceOf(Component);
  });
  it('.show() should display block', () => {
    component.show();
    expect(component.domNode.style.display).to.be.equal('block');
  });
  it('.hide() should display none', () => {
    component.hide();
    expect(component.domNode.style.display).to.be.equal('none');
  });
});