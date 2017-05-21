const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['context helpers'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: ['db', 'users'],
      shutdownSteps: ['db'],
    })

    yield this.clearDb('User')

    this.middleware = this.waigo.load('middleware/currentUser')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'no user': function *() {
    const ctx = {
      session: {},
    }

    let count = 0

    const next = function *() {
      count++
    }

    yield this.middleware().call(ctx, next)

    expect(ctx.currentUser).to.not.exist()

    count.must.eql(1)
  },

  'has user': function *() {
    const user = yield this.App.users.register({
      username: 'test',
    })

    const ctx = {
      App: this.App,
      session: {
        user: {
          id: user.id,
        }
      },
    }

    let count = 0

    const next = function *() {
      count++
    }

    yield this.middleware().call(ctx, next)

    expect(ctx.currentUser).to.exist()
    ctx.currentUser.toJSON().must.eql(user.toJSON())

    count.must.eql(1)
  },
}
