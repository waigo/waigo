const _ = require('lodash'),
  path = require('path')

const log4js = require('log4js')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['log notifier'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: [],
      logging: {
        category: 'test',
        minLevel: 'DEBUG',
        appenders: [],
      },
    })

    this.log = []

    log4js.addAppender((msg) => {
      this.log.push(msg)
    })

    this.notifier = this.waigo.load('notifications/log')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'string': function *() {
    const fn = yield this.notifier(this.App, 'test1')

    yield fn('dummydave')

    const logEvent = this.log.pop()

    _.get(logEvent, 'categoryName').must.eql('LogNotifier/test1')
    _.get(logEvent, 'data').must.eql(['dummydave'])
  },

  'object': function *() {
    const fn = yield this.notifier(this.App, 'test1')

    const data = { test: 'dummydave', abc: 2 }

    yield fn(data)

    const logEvent = this.log.pop()

    _.get(logEvent, 'categoryName').must.eql('LogNotifier/test1')
    _.get(logEvent, 'data').must.eql([ JSON.stringify(data) ])
  },
}
