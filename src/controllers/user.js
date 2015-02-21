"use strict";

/**
 * @fileOverview User controller
 */



exports.login = function*() {
  var reason = this.request.query.r || null,
    postLoginUrl = this.request.query.u || '/';

  this.app.logger.debug('Login', reason, postLoginUrl);

  var form = this.app.form.create('login', {
    context: this
  });

  yield this.render('user/login', {
    reason: reason,
    form: form,
  });
};



exports.loginSubmit = function*() {
  var form = this.app.form.create('login', {
    context: this,
    submitted: true
  });

  try {
    // validate and process form
    form.process();

    // redirect to post-login url
    yield this.redirect(form.fields.postLoginUrl.value);
  } catch (err) {
    yield this.render('user/login', {
      error: err,
      form: form,
    })
  };
};



