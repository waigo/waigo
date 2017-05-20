const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['emailAddressNotInUse'] = {
  beforeEach: function *() {
    yield this.initApp()
    yield this.startApp({
      startupSteps: ['db', 'users'],
      shutdownSteps: ['db'],
    })
    yield this.clearDb('User')

    this.validator = this.waigo.load('forms/support/validators/emailAddressNotInUse')

    this.ctx = {
      App: this.App,
    }
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'is not in use': function *() {
    const fn = this.validator()

    yield fn(this.ctx, null, 'test@test.com')
  },

  'in use': function *() {
    const fn = this.validator()

    yield this.App.users.register({
      username: 'test',
      email: 'test@test.com',
    })

    yield this.mustThrow(fn(this.ctx, null, 'test@test.com'), 'Email already in use')
  },

}
