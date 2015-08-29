console.log('[STUB]', 'LOADED', 'geolocation');

import mock from './geolocation.json!text';

export function geolocation() {
  "use strict";
  return new Promise(function (resolve, reject) {
    var result = JSON.parse(mock);
    result.timeout = 0;
    setTimeout(function () {
      console.log('[STUB]', 'CALL', 'geolocation', result);
      resolve(result);
    }, result.timeout);
  });
}
