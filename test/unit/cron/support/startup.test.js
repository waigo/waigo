const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['cron startup'] = {
  beforeEach: function *() {
    this.createAppModules({
      'cron/support/manager': `module.exports = {
        init: function *() {
          const args = [
            Array.from(arguments).concat(1)
          ]

          return {
            addJob: function *() {
              args.push(Array.from(arguments))
            },
            getArgs: () => args
          }
        }
      }`,
      'cron/sample': `
        exports.schedule = '0 0 3 * * 1';
        exports.handler = function *(App) {}
      `,
      'cron/sample2': `
        exports.schedule = '0 0 5 * * 1';
        exports.handler = function *(App) {}
      `,
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.setup = this.waigo.load('cron/support/startup')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'init': function *() {
    yield this.setup(this.App)

    expect(this.App.cron).to.exist()

    const args = this.App.cron.getArgs()

    args[0][0].must.eql(this.App)
    args[0][1].must.eql(1)
  },
  'adds jobs': function *() {
    yield this.setup(this.App)

    const args = this.App.cron.getArgs()

    args[1][0].must.eql('sample')
    args[2][0].must.eql('sample2')
  },
}
