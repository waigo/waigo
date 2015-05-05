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



exports.forgot_password = function*() {
  var form = yield this.form.create('forgotPassword', {
    context: this
  });

  yield this.render('user/forgotPassword', {
    form: form,
  });
};




exports.forgot_password_submit = function*() {
  var form = yield this.form.create('forgotPassword', {
    context: this
  });

  try {
    yield form.process();

    yield this.showAlert('We have emailed you a link to reset your password.');

    yield this.redirect('/');
  } catch (err) {
    if (!(err instanceof this.form.FormValidationError)) {
      this.logger.error(err.stack);
    }

    yield this.render('user/forgotPassword', {
      error: err,
      form: form,
    }, {
      status: 400
    });
  }
};




exports.reset_password = function*() {
  var action = yield this.app.actionTokens.process(
    this.request.query.c, {
      type: 'reset_password'
    }
  );
  
  // log the user in
  yield action.user.login(this);

  this.logger.debug('Reset password', action.user._id);

  var form = yield this.form.create('resetPassword', {
    context: this
  });

  yield this.render('user/resetPassword', {
    form: form,
  });
};



exports.reset_password_submit = function*() {
  this.logger.debug('Resetting password');

  var form = yield this.form.create('resetPassword', {
    context: this
  });

  try {
    yield form.process();

    yield this.showAlert('Your new password has been saved.');
    yield this.redirect('/');

  } catch (err) {
    if (!(err instanceof this.form.FormValidationError)) {
      this.logger.error(err.stack);
    }

    yield this.render('user/resetPassword', {
      error: err,
      form: form,
    }, {
      status: 400
    });
  };
};
