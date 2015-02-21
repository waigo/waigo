"use strict";

/**
 * @fileOverview User controller
 */



exports.login = function*() {
  var reason = this.request.query.r || null;

  var form = yield this.app.form.create('login', {
    context: this
  });
  form.fields.postLoginUrl.value = this.request.query.u || '/';

  this.app.logger.debug('Login', reason, 
      form.fields.postLoginUrl.value);

  yield this.render('user/login', {
    reason: reason,
    form: form,
  });
};



exports.login_submit = function*() {
  this.app.logger.debug('Logging in');

  var form = yield this.app.form.create('login', {
    context: this,
    submitted: true
  });

  try {
    yield form.process();

    yield this.redirect(form.fields.postLoginUrl.value);
  } catch (err) {
    yield this.render('user/login', {
      error: err,
      form: form,
    })
  };
};



var doesAdminUserExist = function*() {
  return !!(yield this.app.models.User.findOne({
    roles: {
      $in: ['admin']
    }
  }));
};



exports.register = function*() {
  var form = yield this.app.form.create('register', {
    context: this
  });

  this.app.logger.debug('Register');

  var willCreateAdminUser = yield doesAdminUserExist.call(this);

  yield this.render('user/register', {
    form: form,
    willCreateAdminUser: willCreateAdminUser,
  });
};



exports.register_submit = function*() {
  this.app.logger.debug('Registering admin user');

  var form = yield this.app.form.create('register', {
    context: this,
    submitted: true,
  });

  var willCreateAdminUser = yield doesAdminUserExist.call(this);

  try {
    yield form.process();

    yield this.redirect('/');
  } catch (err) {
    yield this.render('user/register', {
      error: err,
      form: form,
      willCreateAdminUser: willCreateAdminUser,
    });
  }
};


