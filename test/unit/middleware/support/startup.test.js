const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['middleware'] = {
  beforeEach: function *() {
    this.createAppModules({
      'middleware/test1': 'module.exports = function (App, options) { return function *() { return ["test1", options, arguments[0]] } }',
      'middleware/test2': 'module.exports = function (App, options) { return function *() { return ["test2", options, arguments[0]] } }',
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.App.config.middleware.ALL = {
      _order: [
        'test1',
        'test2'
      ],
      test1: {
        dummy: 'foo'
      },
      test2: {
        dummy: 'bar'
      }
    }

    this.setup = this.waigo.load('middleware/support/startup')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },

  'loads and initialises middleware': function *() {
    const useSpy = this.mocker.spy(this.App.koa, 'use')

    yield this.setup(this.App)

    useSpy.callCount.must.eql(2)

    let fn = useSpy.getCall(0).args[0]

    let val = yield fn(128)

    val.must.eql([ 'test1', { dummy: 'foo' }, 128 ])

    fn = useSpy.getCall(1).args[0]

    val = yield fn(256)

    val.must.eql(['test2', { dummy: 'bar' }, 256])
  }
}
