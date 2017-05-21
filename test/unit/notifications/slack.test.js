const _ = require('lodash'),
  path = require('path')

const Slack = require('slack-node')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['slack notifier'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })

    this.webhookSpyResult = null
    this.webhookSpy = this.mocker.stub(Slack.prototype, 'webhook', (params, cb) => {
      if (this.webhookSpyResult instanceof Error) {
        cb(this.webhookSpyResult)
      } else {
        cb(null, this.webhookSpyResult)
      }
    })

    this.urlSpy = this.mocker.spy(Slack.prototype, 'setWebhook')

    this.notifier = this.waigo.load('notifications/slack')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'sets webhook url': function *() {
    yield this.notifier(this.App, 'test', {
      url: '/test'
    })

    this.urlSpy.calledWithExactly('/test').must.be.true()
  },

  'error sending to slack': function *() {
    this.webhookSpyResult = new Error('errorblah')

    const fn = yield this.notifier(this.App, 'test', {
      url: '/test',
      channel: 'ch1',
      username: 'user1',
      icon_emoji: 'emoji1',
    })

    yield this.mustThrow(fn('msg'), 'Error: errorblah')

    this.webhookSpy.calledWith({
      channel: 'ch1',
      username: 'user1',
      icon_emoji: 'emoji1',
      text: 'msg',
    }).must.be.true()
  },

  'string': function *() {
    const fn = yield this.notifier(this.App, 'test', {
      url: '/test',
    })

    yield fn('msg')

    _.get(this.webhookSpy.getCall(0), 'args.0.text', '').must.eql('msg')
  },

  'object': function *() {
    const fn = yield this.notifier(this.App, 'test', {
      url: '/test',
    })

    const data = { dummy: true, abc: 123 }

    yield fn(data)

    _.get(this.webhookSpy.getCall(0), 'args.0.text', '').must.eql(
      JSON.stringify(data)
    )
  },
}
