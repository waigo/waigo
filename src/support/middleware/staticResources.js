var path = require('path'),
  waigo = require('../../../');

module.exports = function(staticFolder) {  
  return require('koa-static')(path.join(waigo.getAppFolder(), staticFolder));
};
