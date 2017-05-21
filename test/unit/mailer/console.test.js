const path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['console'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: ['db', 'users', 'mailer'],
      mailer: {
        type: 'console',
        from: 'test@waigojs.com',
      },
    })

    yield this.clearDb('User')

    // lets insert some users
    this.users = yield {
      user1: this.App.users.register({
        username: 'user1',
        email: 'user1@waigojs.com',
      }),
      user2: this.App.users.register({
        username: 'user2',
        email: 'user2@waigojs.com',
      }),
      user3: this.App.users.register({
        username: 'user3',
        email: 'user3@waigojs.com',
      }),
    }

    this.Base = this.waigo.load('mailer/support/base')
    this.Console = this.waigo.load('mailer/console').Console
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'app.mailer instance': function *() {
    this.App.mailer.must.be.instanceof(this.Console)
    this.App.mailer.must.be.instanceof(this.Base)
  },

  'send calls to base class': function *() {
    const spy = this.mocker.stub(this.App.mailer, '_send', () => Q.resolve())

    yield this.App.mailer.send(123)

    spy.calledWith(123).must.be.true()
  },

}
