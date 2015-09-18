/**
 * @module src/app
 */

/**
 * @namespace services.geolocation
 * @class geolocation
 */

/**
 * Very simple geolocation method based on https://freegeoip.net free geoip service
 * (may not be the most accurate nor the most fast or available, but it's only to have some xhr in the code example).
 *
 * Example:
 *
 * ```
 * geolocation()
 *   .then((result) => {
 *     console.log(result);//there you are
 *   })
 *   .catch(e => {
 *     console.error(e);
 *   });
 * ```
 *
 * @method geolocation
 * @param {String} [ipAddress] You can pass a specific IP address to geoloc if you want.
 * @return {Promise}
 */
export function geolocation(ipAddress = "") {
  "use strict";
  let url = `https://freegeoip.net/json/${ipAddress}`;
  return new Promise((resolve, reject) => {
    var time = new Date();
    fetch(url)
      .then(res => res.json())
      .then(json => {
        json.timeout = (new Date()).getTime() - time;
        return resolve(json);
      })
      .catch(e => reject(e));
  });
}
