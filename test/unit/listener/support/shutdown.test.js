const _ = require('lodash')
const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['shutdown listener'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })

    this.step = this.waigo.load('listener/support/shutdown')

    _.extend(this.App.config, {
      mode: 'test',
      port: 3000,
      baseURL: 'http://dummy:4334'
    })
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'shuts down HTTP listener': function *() {
    let closed = 0

    this.App.server = {
      close: function (cb) {
        closed += 1
        cb()
      }
    }

    yield this.step.call(this.step, this.App)

    closed.must.eql(1)
  }

}
