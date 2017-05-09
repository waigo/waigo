const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['activities startup'] = {
  beforeEach: function *() {
    this.createAppModules({
      'activities/index': `module.exports = {
        init: function *() {
          const args = [
            Array.from(arguments).concat(1)
          ]

          return {
            record: function *() {
              args.push(Array.from(arguments))
            },
            getArgs: () => args
          }
        }
      }`
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.setup = this.waigo.load('activities/support/startup')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'init': function *() {
    yield this.setup(this.App)

    expect(this.App.activities).to.exist()

    this.App.activities.getArgs().must.eql([
      [this.App, 1]
    ])
  },
  'handle event: record': function *() {
    yield this.setup(this.App)

    this.App.emit('record', 'test', 123)

    this.App.activities.getArgs()[1].must.eql([
      'test', 123
    ])
  },
}
