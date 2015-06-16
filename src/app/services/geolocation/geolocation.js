export default function (ipAddress = "") {
  "use strict";
  let url = `https://freegeoip.net/json/${ipAddress}`;
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => resolve(res.json()))
      .catch(e => reject(e));
  });
}