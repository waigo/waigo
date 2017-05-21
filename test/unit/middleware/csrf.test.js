const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['context helpers'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })

    this.middleware = this.waigo.load('middleware/csrf')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'csrf': function *() {
    const ctx = {
      response: {},
      request: {},
    }

    let count = 0

    const next = function *() {
      count++
    }

    yield this.middleware().call(ctx, next)

    expect(ctx.assertCSRF).to.exist()
    expect(ctx.request.assertCSRF).to.exist()

    count.must.eql(1)
  },

}
