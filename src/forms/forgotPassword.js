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
      validators: [ 'notEmpty' ],
    },
  ],
  method: 'POST',
  postValidation: [
    function* sendResetPasswordEmail(next) {
      var app = this.context.app;

      var User = app.models.User;

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
          _id: 1,
          auth: 1,
        }
      });

      if (!user) {
        throw new RuntimeError('User not found', 404);
      }

      // action
      var token = app.actionTokens.create('reset_password', user);

      // TODO: send email
      app.logger.info('todo: send email', token)

      yield next;
    }
  ]
};

