const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['notifications'] = {
  beforeEach: function *() {
    this.createAppModules({
      'notifications/test1': 'module.exports = function *(app, id, cfg) { return function *() { app.count1.push(Array.from(arguments)) } }',
      'notifications/test2': 'module.exports = function *(app, id, cfg) { return function *() { app.count2.push(Array.from(arguments)) } }',
      'notifications/test3': 'module.exports = function *(app, id, cfg) { return function *() { app.count3.push(Array.from(arguments)) } }',
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.setup = this.waigo.load('notifications/support/startup')

    this.App.count1 = []
    this.App.count2 = []
    this.App.count3 = []
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'invalid types': function *() {
    this.App.config.notifications = {
      admins: {
        transports: [{ type: 'invalid' }]
      }
    }

    yield this.mustThrow(this.setup(this.App), 'File not found: notifications/invalid')
  },

  'valid types': function *() {
    this.App.config.notifications = {
      admins: {
        transports: [{ type: 'test1' }, { type: 'test2' }]
      },
      admins2: {
        transports: [{ type: 'test3' }]
      },
    }

    yield this.setup(this.App)

    this.App.emit('notify', 'admins', 'str')
    this.App.emit('notify', 'admins2', 'str2')

    this.App.count1.must.eql([['str']])
    this.App.count2.must.eql([['str']])
    this.App.count3.must.eql([['str2']])
  },

}
