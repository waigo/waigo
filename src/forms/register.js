"use strict";


const waigo = global.waigo,
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
    function* createUserAndLogin(next) {
      let ctx = this.context,
        app = ctx.app,
        User = app.models.User;

      // check if there's an admin user
      let adminUserExists = yield User.haveAdminUsers(),
        roles = (adminUserExists ? [] : ['admin']);

      app.logger.info('Registering user ' + this.fields.email.value, roles);

      // create user
      let user = yield User.register({
        username: this.fields.email.value,
        email: this.fields.email.value,
        password: this.fields.password.value,
        roles: roles
      });

      // log them in
      yield user.login(this.context);

      // send confirmation email
      let token = yield app.actionTokens.create('verify_email', user, {
        email: this.fields.email.value,
      });
      
      yield app.mailer.send({
        to: user,
        subject: 'Thanks for signing up!',
        bodyTemplate: 'signupWelcome',
        templateVars: {
          link: app.routes.url('verify_email', null, {
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

