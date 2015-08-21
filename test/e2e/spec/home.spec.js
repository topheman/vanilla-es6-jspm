'use strict';

import {beforeEachIsAngular} from '../utils.js';

beforeEachIsAngular(false);
describe('Home page', () => {
  beforeEachIsAngular(false);
  describe('Simple checks', () => {
    it('should have a title', () => {
      browser.get('http://localhost:9000');
      expect(browser.getTitle()).toEqual('vanilla-es6-jspm');
    });
  });
});
