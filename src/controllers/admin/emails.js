"use strict";





exports.index = function*() {
  yield this.render('admin/emails');
};



exports.render = function*() {
  let body = this.request.body.body,
    subject = this.request.body.subject,
    userId = this.request.body.user;

  this.app.logger.debug('Render email template');

  let user = yield this.app.models.User.get(userId);

  if (!user) {
    this.throw('User not found', 404);
  }

  let output = yield this.app.mailer.render({
    to: user,
    subject: subject,
    body: body,
    allowEmpty: true,
  });

  yield this.render('admin/emails/render', output);
};




exports.send = function*() {
  let body = this.request.body.body,
    subject = this.request.body.subject,
    userIds = this.request.body.users;

  this.app.logger.debug('Send email to users', userIds);

  let users = yield this.app.models.User.findWithIds(userIds);

  if (users.length !== userIds.length) {
    this.throw(`${userIds.length - users.length} users could not be found`, 404);
  }

  yield this.app.mailer.send({
    to: users,
    subject: subject,
    body: body,
  });

  yield this.render('admin/emails/send', {
    result: 'success'
  });
};


