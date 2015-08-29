'use strict';

//in test mode, this is the stub which will be retrieved
import {geolocation} from 'services/geolocation/geolocation.js';

describe('services/geolocation/geolocation.js (stub version)', function () {

  let result = null;

  beforeEach((done) => {
    geolocation().then(function (res) {
      result = res;
      done();
    });
  });

  afterEach(() => {
    result = null;
  });

  it('should make an async call', function (done) {
    expect(result).not.toBe(null);
    done();
  });

  // those values are from `/test/unit/stubs/app/services/geolocation/geolocation.json`
  it('object result values should be correct', function (done) {
    expect(result).toEqual(jasmine.objectContaining({
      "ip": "127.0.0.1",
      "country_code": "FR",
      "country_name": "France",
      "region_code": "",
      "region_name": "",
      "city": "Hello World !!!",
      "zip_code": "",
      "time_zone": "Europe/Paris",
      "latitude": 48.86,
      "longitude": 2.35,
      "metro_code": 0,
      "timeout": 0
    }));
    done();
  });

});
