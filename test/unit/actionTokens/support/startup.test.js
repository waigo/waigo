const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['action tokens'] = {
  beforeEach: function *() {
    this.createAppModules({
      'actionTokens/index': 'module.exports = { init: function *() { return Array.from(arguments).concat(1) } } '
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: [],
      actionTokens: {
        dummy: true,
      },
    })

    this.setup = this.waigo.load('actionTokens/support/startup')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'init action tokens': function *() {
    yield this.setup(this.App)

    expect(this.App.actionTokens).to.eql([
      this.App, { dummy: true }, 1
    ])
  },
}
