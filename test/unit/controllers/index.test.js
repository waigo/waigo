const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['index controller'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.controller = this.waigo.load('controllers/index')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'renders main': function *() {
    const ret = []

    const ctx = {
      render: function *() {
        ret.push(Array.from(arguments))
      }
    }

    yield this.controller.main.call(ctx)

    ret.must.eql([['index']])
  }
}
