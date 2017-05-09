const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['db shutdown'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.method = this.waigo.load('db/support/shutdown')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'destroys dbs': function *() {
    const ret = []

    this.App.dbs = {
      db1: {
        destroy: function *() {
          ret.push(1)
        }
      },
      db2: {
        destroy: function *() {
          ret.push(2)
        }
      }
    }

    yield this.method(this.App)

    ret.must.eql([1, 2])
  },
}
