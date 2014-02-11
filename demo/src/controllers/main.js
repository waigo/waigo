var waigo = require('../../');

var libMainController = waigo.load('lib:controllers/main');

exports.index = function*(next) {
  yield libMainController.index.call(this, next);
};


