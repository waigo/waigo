"use strict";


var waigo = require('../../'),
  _ = waigo._,
  RuntimeError = waigo.load('support/errors').RuntimeError;


module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address / Username',
      required: true,
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty', 'isEmailAddress' ],
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
      var User = this.context.app.models.User;

      // load user
      var user = yield User.findOne({
        $or: [
          {
            username: this.fields.email.value,
          },
          {
            'emails.email': this.fields.email.value,
          }
        ]
      }, {
        fields: {
          _id: 1
        }
      });

      // check user and password
      if (!user 
          || !(yield user.isPasswordCorrect(this.fields.password.value)) ) {
        throw new RuntimeError('Incorrect username or password', 400);
      }

      // log the user in
      yield user.login(this.context);

      yield next;
    }
  ]
};

