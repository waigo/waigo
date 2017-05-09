const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['activities shutdown'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.method = this.waigo.load('activities/support/shutdown')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'removes event handler': function *() {
    let count = 0

    this.App.on('record', () => {
      count++
    })

    this.App.emit('record')

    count.must.eql(1)

    yield this.method(this.App)

    this.App.emit('record')

    count.must.eql(1)
  },
}
