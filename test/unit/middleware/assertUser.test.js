const _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['assert user'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: ['routes'],
      shutdownSteps: [],
    })

    this.ctx = {
      App: this.App,
    }

    this.assertUser = this.waigo.load('middleware/assertUser')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'user must be logged in': function *() {
    yield this.mustThrow(
      this.assertUser(this.App, {}).call(this.ctx, Q.resolve()),
      'You must be logged in to access this content'
    )
  },

  'check if can access': function *() {
    const spy = this.mocker.spy(() => Q.resolve())

    this.ctx.currentUser = {
      assertAccess: spy,
    }

    yield this.assertUser(this.App, {canAccess: 'admin'}).call(this.ctx, Q.resolve())

    spy.calledWithExactly('admin').must.be.true()
  },

  'calls next if ok': function *() {
    let count = 0

    this.ctx.currentUser = {}

    yield this.assertUser(this.App, {}).call(this.ctx, function *() {
      count++
    })

    count.must.eql(1)
  },

  'fail - redirect': function *() {
    _.extend(this.ctx, {
      currentUser: {
        assertAccess: function *() {
          throw new Error('blah')
        }
      },
      request: {
        url: 'test2'
      },
      redirect: this.mocker.spy(() => Q.resolve()),
    })

    const routeSpy = this.mocker.spy(this.App.routes, 'url')

    yield this.assertUser(this.App, {
      redirectToLogin: true,
      canAccess: 'admin'
    }).call(this.ctx)

    routeSpy.calledWithExactly('user_login', null, {
      r: 'blah',
      u: 'test2',
    }).must.be.true()

    this.ctx.redirect.calledWithExactly(
      routeSpy.getCall(0).returnValue
    ).must.be.true()
  },


  'fail - no redirect': function *() {
    _.extend(this.ctx, {
      currentUser: {
        assertAccess: function *() {
          throw new Error('blah')
        }
      },
    })

    yield this.mustThrow(this.assertUser(this.App, {
      canAccess: 'admin'
    }).call(this.ctx), 'blah')
  },
}
