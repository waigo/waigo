

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const Slack = require('slack-node')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigovar notifier = nulltest['slack notifier'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })this.webhookSpyResult = nullthis.webhookSpy = this.mocker.stub(Slack.prototype, 'webhook', (params, cb) => {
      if (this.webhookSpyResult instanceof Error) {
        cb(this.webhookSpyResult)} else {
        cb(null, this.webhookSpyResult)}
    })this.urlSpy = this.mocker.spy(Slack.prototype, 'setWebhook')notifier = waigo.load('support/notifications/slack')},

  afterEach: function *() {
    yield this.shutdownApp()},

  'sets webhook url': function *() {
    let fn = yield notifier(this.App, 'test', {
      url: '/test'
    })this.urlSpy.should.have.been.calledWithExactly('/test')},

  'error sending to slack': function *() {
    this.webhookSpyResult = new Error('errorblah')let fn = yield notifier(this.App, 'test', {
      url: '/test',
      channel: 'ch1',
      username: 'user1',
      icon_emoji: 'emoji1',
    })yield this.shouldThrow(fn('msg'), 'errorblah')this.webhookSpy.should.have.been.calledWith({
      channel: 'ch1',
      username: 'user1',
      icon_emoji: 'emoji1',
      text: 'msg',
    })},

  'string': function *() {
    let fn = yield notifier(this.App, 'test', {
      url: '/test',
    })yield fn('msg')_.get(this.webhookSpy.getCall(0), 'args.0.text', '').should.eql('msg')},

  'object': function *() {
    let fn = yield notifier(this.App, 'test', {
      url: '/test',
    })let data = { dummy: true, abc: 123 }yield fn(data)_.get(this.webhookSpy.getCall(0), 'args.0.text', '').should.eql(
      JSON.stringify(data)
    )},
}