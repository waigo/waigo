

exports.index = function*() {
  yield this.render('admin/emails', {
    menu: this.app.config.adminMenu,
  });
};



exports.render = function*() {
  var body = this.request.body.body,
    subject = this.request.body.subject,
    userId = this.request.body.user;

  this.app.logger.debug('Render "send email" template');

  var user = yield this.app.models.User.findOne({
    _id: userId
  });

  if (!user) {
    this.throw('User not found', 404);
  }

  var output = yield this.app.mailer.render({
    to: user,
    subject: subject,
    body: body,
    allowEmpty: true,
  });

  yield this.render('admin/emails/render', output);
};


