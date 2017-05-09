const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['index controller'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.method = this.waigo.load('cron/support/shutdown')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'destroys cron': function *() {
    let called = false

    this.App.cron = {
      destroy: function *() {
        called = true
      }
    }

    yield this.method(this.App)

    called.must.be.true()
  },
}
