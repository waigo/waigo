exports.index = function*(next) {
  this.body = yield this.render('index')
};


