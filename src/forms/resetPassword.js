"use strict";


const waigo = global.waigo,
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
      validators: [{
        id: 'compareToField',
        field: 'password',
        comparison: 'eq',
      }],
    },
  ],
  method: 'POST',
  postValidation: [
    function* updateUserPassword(next) {
      let ctx = this.context,
        app = ctx.app,
        user = ctx.currentUser;

      app.logger.info('Resetting user password', user.id);

      // save new password
      yield user.updatePassword(this.fields.password.value);

      yield next;
    },
    function* emailUser(next) {
      let ctx = this.context,
        app = ctx.app,
        user = ctx.currentUser;

      yield app.mailer.send({
        to: user,
        subject: 'Your password has been updated',
        bodyTemplate: 'passwordUpdated',
      });

      yield next;
    },
  ]
};

