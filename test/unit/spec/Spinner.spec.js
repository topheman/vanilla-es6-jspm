'use strict';

import Spinner from 'components/Spinner/Spinner.js';

describe('components/Spinner/Spinner.js', function () {

  let spinner;
  let htmlElement;
  let expectedInnerHTML = `<div id="circularG">
  <div id="circularG_1" class="circularG">
  </div>
  <div id="circularG_2" class="circularG">
  </div>
  <div id="circularG_3" class="circularG">
  </div>
  <div id="circularG_4" class="circularG">
  </div>
  <div id="circularG_5" class="circularG">
  </div>
  <div id="circularG_6" class="circularG">
  </div>
  <div id="circularG_7" class="circularG">
  </div>
  <div id="circularG_8" class="circularG">
  </div>
</div>
`;

  beforeEach(()=> {
    htmlElement = document.createElement('div');
    spinner = new Spinner(htmlElement);
  });

  it('.init method should be defined', ()=> {
    expect(spinner.init).not.toBe(undefined);
  });
  it('.init() should return this', () => {
    expect(spinner.init() instanceof Spinner).toBe(true);
  });
  it('.domNode.innerHTML should be correct', () => {
    expect(spinner.domNode.innerHTML).toEqual(expectedInnerHTML);
  });

});
