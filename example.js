let fpAPI = require('./src/fairplay-api-wrapper');

(async () => {
  let connected = await fpAPI.get_connected();
  console.log(connected);
})();