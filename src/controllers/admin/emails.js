"use strict";


var toObjectID = require('robe').Utils.toObjectID;



exports.index = function*() {
  yield this.render('admin/emails', {
    menu: this.app.config.adminMenu,
  });
};



exports.render = function*() {
  var body = this.request.body.body,
    subject = this.request.body.subject,
    userId = this.request.body.user;

  this.app.logger.debug('Render email template');

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




exports.send = function*() {
  var body = this.request.body.body,
    subject = this.request.body.subject,
    userIds = this.request.body.users;

  this.app.logger.debug('Send email to users', userIds);

  var users = yield this.app.models.User.find({
    _id: {
      $in: userIds.map(function(v) {
        return toObjectID(v);
      })
    }
  });

  if (users.length !== userIds.length) {
    this.throw('Some users could not be found', 404);
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


