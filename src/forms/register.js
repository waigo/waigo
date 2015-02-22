"use strict";


var waigo = require('../../'),
  _ = waigo._;


module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address',
      required: true,
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty', 'isEmailAddress', 'emailAddressNotInUse' ],
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ],
    },
  ],
  method: 'POST',
  postValidation: [
    function* createUser(next) {
      var app = this.context.app,
        User = app.models.User;

      // check if there's an admin user
      var adminUserExists = !!(yield User.findAdminUser()),
        roles = (adminUserExists ? [] : ['admin']);

      app.logger.info('Registering user', this.fields.email.value, roles);

      var user = yield User.register({
        email: this.fields.email.value,
        password: this.fields.password.value,
        roles: roles
      });

      yield user.login(this.context);

      yield next;
    }
  ]
};

