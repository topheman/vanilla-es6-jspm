'use strict';

import Component from 'components/Component/Component.js';

describe('components/Component/Component.js', function () {

  let component;
  let htmlElement;

  beforeEach(()=> {
    htmlElement = document.createElement('div');
    component = new Component(htmlElement);
  });

  it('.init method should be defined', ()=> {
    expect(component.init).not.toBe(undefined);
  });
  it('.init() should return this', () => {
    expect(component.init() instanceof Component).toBe(true);
  });
  it('.show() should display block', () => {
    component.show();
    expect(component.domNode.style.display).toEqual('block');
  });
  it('.hide() should display none', () => {
    component.hide();
    expect(component.domNode.style.display).toEqual('none');
  });
});
