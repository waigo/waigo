"use strict";

/**
 * @fileOverview User controller
 */


exports.logout = function*() {
  delete this.session.user;

  yield this.redirect('/');
};


exports.login = function*() {
  let reason = this.request.query.r || null;

  let form = yield this.form.create('login', {
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

  let form = yield this.form.create('login', {
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
  let form = yield this.form.create('register', {
    context: this
  });

  this.logger.debug('Register');

  let adminUserExists = yield this.models.User.haveAdminUsers();

  yield this.render('user/register', {
    form: form,
    willCreateAdminUser: !adminUserExists,
  });
};



exports.register_submit = function*() {
  this.logger.debug('Registering user');

  let form = yield this.form.create('register', {
    context: this,
    submitted: true,
  });

  let adminUserExists = yield this.models.User.haveAdminUsers();

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



exports.verify_email = function*() {
  let action = yield this.app.actionTokens.process(
    this.request.query.c, {
      type: 'verify_email'
    }
  );
  
  this.logger.debug('Verify email address', action.user.id, action.data.email);

  // verify email address
  yield action.user.verifyEmail(action.data.email);

  // log the user in
  yield action.user.login(this);

  yield this.showAlert('Your email address has been verified.');

  yield this.redirect('/');
};





exports.forgot_password = function*() {
  let form = yield this.form.create('forgotPassword', {
    context: this
  });

  yield this.render('user/forgotPassword', {
    form: form,
  });
};




exports.forgot_password_submit = function*() {
  let form = yield this.form.create('forgotPassword', {
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
  let action = yield this.app.actionTokens.process(
    this.request.query.c, {
      type: 'reset_password'
    }
  );
  
  // log the user in
  yield action.user.login(this);

  this.logger.debug('Reset password', action.user.id);

  let form = yield this.form.create('resetPassword', {
    context: this
  });

  yield this.render('user/resetPassword', {
    form: form,
  });
};



exports.reset_password_submit = function*() {
  this.logger.debug('Resetting password');

  let form = yield this.form.create('resetPassword', {
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
