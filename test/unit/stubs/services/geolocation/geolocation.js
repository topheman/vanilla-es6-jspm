console.log('mock loaded');

import mock from './geolocation.json!text';

export default function () {
  "use strict";
  function resolveServicesGeolocation() {
    return JSON.parse(mock);
  }

  function rejectServicesGeolocation() {
    return new Error();
  }

  console.log('mock called');
  return new Promise(resolveServicesGeolocation, rejectServicesGeolocation);
}
