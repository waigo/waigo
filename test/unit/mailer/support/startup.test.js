const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['mailer'] = {
  beforeEach: function *() {
    this.createAppModules({
      'mailer/test': 'exports.create = function *() { return Array.from(arguments) }',
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.setup = this.waigo.load('mailer/support/startup')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'mailer config not set': function *() {
    this.App.config.mailer = null

    yield this.mustThrow(this.setup(this.App), 'Mailer type not set')
  },
  'mailer type invalid': function *() {
    this.App.config.mailer = { type: 'invalid' }

    yield this.mustThrow(this.setup(this.App), 'File not found: mailer/invalid')
  },
  'mailer type valid': function *() {
    this.App.config.mailer = { type: 'test', dummy: true }

    yield this.setup(this.App)

    this.App.mailer.must.eql([ this.App, { type: 'test', dummy: true } ])
  },
}
