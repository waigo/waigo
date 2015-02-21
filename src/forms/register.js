"use strict";


var waigo = require('../../'),
  _ = waigo._;


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
    function* createUser(next) {
      var User = this.context.app.models.User;

      // check if there's an admin user
      var adminUserExists = !!(yield User.findOne({
        roles: {
          $in: ['admin']
        }
      }));

      var user = yield User.create({
        email: this.fields.email.value,
        password: this.field.password.value,
        roles: (adminUserExists ? [] : ['admin'])
      });

      yield user.login(this.context);

      yield next;
    }
  ]
};

