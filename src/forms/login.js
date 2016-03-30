"use strict";


const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors');

const LoginError = errors.define('LoginError');


module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address / Username',
      required: true,
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ],
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ],
    },
    {
      // where to take take user once logged-in
      name: 'postLoginUrl',
      type: 'hidden',
    },
  ],
  method: 'POST',
  postValidation: [
    function* checkUserCredentials(next) {
      let ctx = this.context;

      let User = ctx.app.models.User;

      // load user
      let user = yield User.getByEmailOrUsername(this.fields.email.value);

      // check user and password
      if (!user 
          || !(yield user.isPasswordCorrect(this.fields.password.value)) ) {
        ctx.throw(LoginError, 'Incorrect username or password', 400);
      }

      // log the user in
      yield user.login(this.context);

      yield next;
    }
  ]
};

