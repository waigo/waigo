"use strict";


var waigo = require('../../'),
  _ = waigo._;


module.exports = {
  fields: [
    {
      name: 'password',
      type: 'password',
      label: 'New password',
      required: true,
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ],
    },
    {
      name: 'confirm_password',
      type: 'password',
      label: 'Confirm password',
      required: true,
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ],
    },
  ],
  method: 'POST',
  postValidation: [
    function* updateUserPassword(next) {
      var app = this.context.app,
        user = this.context.currentUser;

      app.logger.info('Resetting user password', user._id);

      // save new password
      yield user.updatePassword(this.fields.password.value);

      yield next;
    },
    function* emailUser(next) {
      this.context.app.logger.info('TODO: Email user about password change');
      // TODO: send email
      // 
      yield next;
    },
  ]
};

