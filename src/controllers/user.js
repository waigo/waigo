"use strict";

/**
 * @fileOverview User controller
 */


exports.logout = function*() {
  delete this.session.user;

  yield this.redirect('/');
};


exports.login = function*() {
  var reason = this.request.query.r || null;

  var form = yield this.form.create('login', {
    context: this
  });
  form.fields.postLoginUrl.value = this.request.query.u || '/';

  this.logger.debug('Login', reason, 
      form.fields.postLoginUrl.value);

  yield this.render('user/login', {
    reason: reason,
    form: form,
  });
};



exports.login_submit = function*() {
  this.logger.debug('Logging in');

  var form = yield this.form.create('login', {
    context: this
  });

  try {
    yield form.process();

    yield this.redirect(form.fields.postLoginUrl.value || '/');
  } catch (err) {
    if (!(err instanceof this.form.FormValidationError)) {
      this.logger.error(err.stack);
    }

    yield this.render('user/login', {
      error: err,
      form: form,
    }, {
      status: 400
    });
  };
};




exports.register = function*() {
  var form = yield this.form.create('register', {
    context: this
  });

  this.logger.debug('Register');

  var adminUserExists = 
    !!(yield this.models.User.findAdminUser());

  yield this.render('user/register', {
    form: form,
    willCreateAdminUser: !adminUserExists,
  });
};



exports.register_submit = function*() {
  this.logger.debug('Registering user');

  var form = yield this.form.create('register', {
    context: this,
    submitted: true,
  });

  var adminUserExists = 
    !!(yield this.models.User.findAdminUser());

  try {
    yield form.process();

    yield this.redirect('/');
  } catch (err) {
    if (!(err instanceof this.form.FormValidationError)) {
      this.logger.error(err.stack);
    }

    yield this.render('user/register', {
      error: err,
      form: form,
      willCreateAdminUser: !adminUserExists,
    }, {
      status: 400
    });
  }
};

