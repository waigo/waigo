const waigo = global.waigo,
  errors = waigo.load('errors')


const ForgotPasswordError = errors.define('ForgotPasswordError')


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
    function *sendResetPasswordEmail (next) {
      const ctx = this.context,
        App = ctx.App

      const User = App.models.User

      // load user
      const user = yield User.getByEmailOrUsername(this.fields.email.value)

      if (!user) {
        ctx.throw(ForgotPasswordError, 'User not found', 404)
      }

      // action
      const token = yield App.actionTokens.create('reset_password', user)

      App.logger.debug('Reset password token for ' + user.id, token)

      // record
      App.emit('record', 'reset_password', user)

      // send email
      yield App.mailer.send({
        to: user,
        subject: 'Reset your password',
        bodyTemplate: 'resetPassword',
        templateVars: {
          link: App.routes.url('reset_password', null, {
            c: token
          }, {
            absolute: true
          })
        }
      })

      yield next
    }
  ]
}
