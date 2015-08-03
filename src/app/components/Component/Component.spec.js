'use strict';

import {expect} from 'chai';

import Component from './Component.js';

describe('ES6 Component', function () {

  let component;

  beforeEach(()=>{
    component = new Component();
  });

  it('should return Do Something when calling doSomething', ()=>{
    expect(component.init).toEqual('Do Something');
  });
});