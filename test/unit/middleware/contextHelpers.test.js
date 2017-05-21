const _ = require('lodash'),
  path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['context helpers'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.middleware = this.waigo.load('middleware/contextHelpers')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'sets context': function *() {
    const ctx = {
      currentUser: 2,
      request: {
        url: 53,
      },
      App: {
        logger: 1,
        acl: 3,
        models: 4,
        form: 5,
      }
    }

    let count = 0

    const next = function *() {
      count++
    }

    yield this.middleware().call(ctx, next)

    expect(_.get(ctx, 'templateVars.currentUser', '')).to.eql(2)
    expect(_.get(ctx, 'templateVars.currentUrl', '')).to.eql(53)
    expect(ctx.logger).to.eql(1)
    expect(ctx.acl).to.eql(3)
    expect(ctx.models).to.eql(4)
    expect(ctx.form).to.eql(5)

    count.must.eql(1)
  },

}
