'use strict';

/**
 * This test is only run when the --with-docs flag is active : `npm run test-e2e -- --with-docs`
 * or when WITH_DOCS env variable is declared at true
 *
 * It's only meant to be run against a built version (also built with the flag --with-docs or WITH_DOCS env variable declared)
 *
 * This is not a documented feature. This is more to ensure on travis that not only:
 * - the doc generates correctly without failing
 * - but it also generates a correct output
 */

// before each 'it' of the following describe:
describe('Docs home page /docs', () => {
  beforeEach(() => {
    //go to page (if not yet)
    goToUrl('/docs');
  });
  it('should have a title', () => {
    expect(browser.getTitle()).toEqual('vanilla-es6-jspm');
  });
  it('should have a title in the header', () => {
    expect(element(by.css('h1.blue-main-title')).getText()).toEqual('vanilla-es6-jspm');
  });
});
