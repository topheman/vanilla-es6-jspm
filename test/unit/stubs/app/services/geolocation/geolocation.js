console.log('[STUB]', 'LOADED', 'geolocation');

import mock from './geolocation.json!text';

export default function () {
  "use strict";
  return new Promise(function (resolve, reject) {
    var result = JSON.parse(mock);
    console.log('[STUB]', 'CALL', 'geolocation', result);
    resolve(result);
  });
}
