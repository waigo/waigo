"use strict";


const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors');


const ForgotPasswordError = errors.define('ForgotPasswordError');


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
      let app = this.context.app;

      let User = app.models.User;

      // load user
      let user = yield User.findOne({
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
          username: 1,
          profile: 1,
          emails: 1,
        }
      });

      if (!user) {
        throw new ForgotPasswordError('User not found', 404);
      }

      // action
      let token = yield app.actionTokens.create('reset_password', user);

      app.logger.debug('Reset password token for ' + user._id , token);

      // record
      yield app.record('reset_password', user);

      // send email
      yield app.mailer.send({
        to: user,
        subject: 'Reset your password',
        bodyTemplate: 'resetPassword',
        locals: {
          link: app.routeUrl('reset_password', null, {
            c: token
          }, {
            absolute: true
          })
        }
      });

      yield next;
    }
  ]
};

