let fpAPI = require('./src/fairplay-api-wrapper');

;(async () => {

  console.log(await fpAPI.get_front_resources());

})();