

exports.index = function*() {
  yield this.render('admin/emails', {
    menu: this.app.config.adminMenu,
  });
};



exports.render = function*() {
  var template = this.request.body.template,
    userId = this.request.body.user;

  this.app.logger.debug('Render "send email" template');

  var user = yield this.app.models.User.findOne({
    _id: userId
  });

  if (!user) {
    this.throw('User not found', 404);
  }

  yield this.render('admin/emails/render', {
    html: '<p>test</p>',
  });
};


