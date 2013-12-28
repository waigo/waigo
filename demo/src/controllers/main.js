var waigo = GLOBAL.waigo;

var libMainController = waigo.load('lib:controllers.main');

exports.index = function*(next) {
  this.session.value = Math.random() * 50;
  this.session._sid = 'blah';
  yield libMainController.index.call(this, next);
};


