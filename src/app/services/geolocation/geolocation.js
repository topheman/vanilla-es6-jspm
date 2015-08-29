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
