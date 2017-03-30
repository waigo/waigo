


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
      const ctx = this.context,
        App = ctx.App,
        User = App.models.User;

      // check if there's an admin user
      const adminUserExists = yield User.haveAdminUsers(),
        roles = (adminUserExists ? [] : ['admin']);

      App.logger.info('Registering user ' + this.fields.email.value, roles);

      // create user
      const user = yield User.register({
        username: this.fields.email.value,
        email: this.fields.email.value,
        password: this.fields.password.value,
        roles: roles
      });

      // log them in
      yield user.login(this.context);

      // send confirmation email
      const token = yield App.actionTokens.create('verify_email', user, {
        email: this.fields.email.value,
      });
      
      yield App.mailer.send({
        to: user,
        subject: 'Thanks for signing up!',
        bodyTemplate: 'signupWelcome',
        templateVars: {
          link: App.routes.url('verify_email', null, {
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

