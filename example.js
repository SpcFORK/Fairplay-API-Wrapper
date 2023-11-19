let fpAPI = require('./src/fairplay-api-wrapper');

(async () => {
  let connected = await fpAPI.get_front_resources();
  console.log(connected);
})();