'use strict';

describe('Home page', () => {
  // before each 'it' of the following describe:
  beforeEach(() => {
    //go to page (if not yet)
    goToUrl('/');
    //wait for the component to be loaded
    browser.driver.wait(() => {
      //will stop wait when the element is displayed - (~like a DOM Ready for e2e tests) - timeout is only here to error in case it takes too long
      return browser.driver.findElement(by.id('geolocation')).isDisplayed();
    }, 4000);
  });
  it('should have a title', () => {
    expect(browser.getTitle()).toEqual('vanilla-es6-jspm');
  });
  it('geolocation widget should be present', () => {
    expect(element(by.id('geolocation')).isPresent()).toBeTruthy();
  });
  it('results should show on "click to launch geolocation"', () => {
    browser.findElement(by.css('button.geolocation-button')).click().then(() => {
      expect(element(by.css('.geolocation-infos')).isDisplayed()).toBeTruthy();
    });
  });
  it('results should be right on "click to launch geolocation"', () => {
    browser.findElement(by.css('button.geolocation-button')).click().then(() => {
      expect(element.all(by.css('.geolocation-infos li')).first().getText()).toEqual('City: Hello World !!!');
    });
  });
});
