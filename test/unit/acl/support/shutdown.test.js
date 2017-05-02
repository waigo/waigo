const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['acl'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.shutdownStep = this.waigo.load('acl/support/shutdown')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'shuts down the listener': function *() {
    let count = 0

    this.App.acl = {
      destroy: function *() {
        count++
      }
    }

    yield this.shutdownStep(this.App)

    expect(count).to.eql(1)
  }
}
