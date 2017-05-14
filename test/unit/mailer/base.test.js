

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['base'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp({
      startupSteps: ['db', 'models', 'mailer', 'appTemplateVars'],
      shutdownSteps: ['db'],
    })yield this.clearDb('User')// lets insert some users
    this.users = yield {
      user1: this.App.models.User.register({
        username: 'user1',
        email: 'user1@waigojs.com',
      }),
      user2: this.App.models.User.register({
        username: 'user2',
        email: 'user2@waigojs.com',
      }),
      user3: this.App.models.User.register({
        username: 'user3',
        email: 'user3@waigojs.com',
      }),
    }this.MailerBase = waigo.load('support/mailer/base')this.NodeMailer = waigo.load('support/mailer/engines/nodeMailer').NodeMailer},

  afterEach: function *() {
    yield this.clearDb()yield this.shutdownApp()},

  'app.mailer instance': function *() {
    this.App.mailer.must.be.instanceof(this.MailerBase)},

  'rendering': {
    'need recipients': function *() {
      yield this.shouldThrow(this.App.mailer.render(), 'Recipients must be set')},

    'need subject and body': function *() {
      yield this.shouldThrow(this.App.mailer.render({
        to: 'test@waigojs.com'
      }), 'Subject and body/template must be set')},

    'markdown': function *() {
      let ret = yield this.App.mailer.render({
        to: this.users.user1,
        body: '**This** _is_ markdown',
        subject: '**This** _is_ not markdown',
      })_.get(ret, 'body').must.eql(
        '<p>user1,</p><div><p><strong>This</strong> <em>is</em> markdown</p>\n</div><p>thanks,<br />Waigo administrators</p>'
      )_.get(ret, 'subject').must.eql('**This** _is_ not markdown')},

    'body template': function *() {
      let ret = yield this.App.mailer.render({
        to: this.users.user1,
        bodyTemplate: 'passwordUpdated',
        subject: 'subj',
      })_.get(ret, 'body').must.contain('user1,')_.get(ret, 'body').must.contain('Waigo administrators')_.get(ret, 'body').must.contain('successfully reset your password')},

    'use email address instead': function *() {
      let ret = yield this.App.mailer.render({
        to: 'user1@waigojs.com',
        bodyTemplate: 'passwordUpdated',
        subject: 'subj',
      })_.get(ret, 'body').must.contain('user1@waigojs.com,')_.get(ret, 'body').must.contain('Waigo administrators')_.get(ret, 'body').must.contain('successfully reset your password')},
  },

  'got NodeMailer instance': function *() {
    this.App.mailer._nodeMailer.must.be.instanceof(this.NodeMailer)},

  'sending': {
    beforeEach: function *() {
      this.spy = this.mocker.stub(this.App.mailer._nodeMailer, '_send', () => Q.resolve())},

    'sends to nodemailer': function *() {
      let spy = this.spyyield this.App.mailer._send({
        to: [this.users.user1, this.users.user2, this.users.user3],
        subject: 'subj',
        body: '**body**',
      })let arr = _.map(spy.args || [], (arg) => _.get(arg, '0.to'))arr.sort()arr.must.eql([
        'user1@waigojs.com', 
        'user2@waigojs.com',
        'user3@waigojs.com',
      ])_.map(spy.args || [], (arg) => _.get(arg, '0.from')).must.eql([
        'System <waigo@localhost>',
        'System <waigo@localhost>',
        'System <waigo@localhost>',
      ])_.map(spy.args || [], (arg) => _.get(arg, '0.replyTo')).must.eql([
        'System <waigo@localhost>',
        'System <waigo@localhost>',
        'System <waigo@localhost>',
      ])_.map(spy.args || [], (arg) => _.get(arg, '0.subject')).must.eql([
        'subj',
        'subj',
        'subj',
      ])_.get(spy.args, '0.0.html').must.contain('<div><p><strong>body</strong></p>\n</div>')},
    'records activity': function *() {
      let spy = this.mocker.spy()this.App.on('record', spy)yield this.App.mailer._send({
        to: [this.users.user1, this.users.user2, this.users.user3],
        subject: 'subj',
        body: '**body**',
      })spy.must.have.been.calledWith('email', this.users.user1, {
        subject: 'subj',
      })spy.must.have.been.calledWith('email', this.users.user2, {
        subject: 'subj',
      })spy.must.have.been.calledWith('email', this.users.user3, {
        subject: 'subj',
      })},
  },

}