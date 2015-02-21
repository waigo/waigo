"use strict";


var waigo = require('../../'),
  _ = waigo;


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
      type: 'text',
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
  postCreation: [
    function* setBackToUrlValue(form, next) {
      if (!form.fields.backTo.value) {
        form.fields.backTo.value = 
          _.get(form, 'context.request.query.backTo', '/');
      }

      yield next;
    }
  ],
  postValidation: [
    function* updateUserLoginTimestamp(form, next) {
      // update user's "last logged-in" timestamp in db
      yield this.app.models.User.update({
        $or: [
          {
            username: form.fields.email.value,
          },
          {
            'emails.email': form.fields.email.value,
          }
        ]
      }, {
        $set: {
          lastLogin: Date.now(),
        }
      });

      yield next;
    }
  ]
};

