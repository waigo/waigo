const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test.beforeEach = function *() {
  this.deleteTestFolders()
  this.createTestFolders()
}

test.afterEach = function *() {
  this.deleteTestFolders()
}


test['config loader'] = {
  beforeEach: function *() {
    this.originalMode = process.env.NODE_ENV

    const modulesToCreate = {
      'config/base': 'module.exports = function (config) { config.base = 1 }',
      'config/development': 'module.exports = function (config) { config.dev = 1 }',
      'config/random': 'module.exports = function (config) { config.random = 1 }',
      'config/error': 'module.exports = function (config) { throw new Error("haha") }'
    }
    modulesToCreate['config/development.' + process.env.USER] = 'module.exports = function (config) { config.dev_user = 1 }'

    this.createAppModules(modulesToCreate)

    yield this.initApp()
  },
  afterEach: function *() {
    process.env.NODE_ENV = this.originalMode

    this.deleteTestFolders()
  },
  'defaults': function *() {
    process.env.NODE_ENV = 'development'

    this.waigo.load('config/index')().must.eql({
      mode: 'development',
      user: process.env.USER,
      base: 1,
      dev: 1,
    })
  },
  'set mode': function *() {
    process.env.NODE_ENV = 'random'

    this.waigo.load('config/index')().must.eql({
      mode: 'random',
      user: process.env.USER,
      base: 1,
      random: 1
    })
  },
  'set bad mode': function *() {
    process.env.NODE_ENV = 'notfound'

    this.waigo.load('config/index')().must.eql({
      mode: 'notfound',
      user: process.env.USER,
      base: 1
    })
  },
  'error in config file': function *() {
    process.env.NODE_ENV = 'error'

    expect(this.waigo.load('config/index')).to.throw('haha')
  }
}
