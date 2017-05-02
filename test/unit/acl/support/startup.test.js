const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['acl'] = {
  beforeEach: function *() {
    this.createAppModules({
      'acl/index': 'module.exports = { init: function *() { return Array.from(arguments).concat(1) } } '
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.setup = this.waigo.load('acl/support/startup')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'init acl': function *() {
    yield this.setup(this.App)

    expect(this.App.acl).to.eql([this.App, 1])
  },
}
