const _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['base'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: ['db', 'users', 'mailer']
    })

    yield this.clearDb('User')

    // lets insert some users
    this.users = yield {
      user1: this.App.users.register({
        username: 'user1',
        email: 'user1@waigojs.com',
      }),
      user2: this.App.users.register({
        username: 'user2',
        email: 'user2@waigojs.com',
      }),
      user3: this.App.users.register({
        username: 'user3',
        email: 'user3@waigojs.com',
      }),
    }

    this.MailerBase = this.waigo.load('mailer/support/base')
    this.NodeMailer = this.waigo.load('mailer/support/engines/nodeMailer').NodeMailer
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'app.mailer instance': function *() {
    this.App.mailer.must.be.instanceof(this.MailerBase)
  },

  'rendering': {
    'need recipients': function *() {
      yield this.mustThrow(this.App.mailer.render(), 'Recipients must be set')
    },

    'need subject and body': function *() {
      yield this.mustThrow(this.App.mailer.render({
        to: 'test@waigojs.com'
      }), 'Subject and body/template must be set')
    },

    'markdown': function *() {
      const ret = yield this.App.mailer.render({
        to: this.users.user1,
        body: '**This** _is_ markdown',
        subject: '**This** _is_ not markdown',
      })

      _.get(ret, 'body').must.eql(
        '<p>user1,</p><div><p><strong>This</strong> <em>is</em> markdown</p>\n</div><p>thanks,<br />Waigo administrators</p>'
      )
      _.get(ret, 'subject').must.eql('**This** _is_ not markdown')
    },

    'body template': function *() {
      const ret = yield this.App.mailer.render({
        to: this.users.user1,
        bodyTemplate: 'passwordUpdated',
        subject: 'subj',
      })

      _.get(ret, 'body').must.contain('user1,')
      _.get(ret, 'body').must.contain('Waigo administrators')
      _.get(ret, 'body').must.contain('successfully reset your password')
    },

    'use email address instead': function *() {
      const ret = yield this.App.mailer.render({
        to: 'user1@waigojs.com',
        bodyTemplate: 'passwordUpdated',
        subject: 'subj',
      })

      _.get(ret, 'body').must.contain('user1@waigojs.com,')
      _.get(ret, 'body').must.contain('Waigo administrators')
      _.get(ret, 'body').must.contain('successfully reset your password')
    },
  },

  'got NodeMailer instance': function *() {
    this.App.mailer._nodeMailer.must.be.instanceof(this.NodeMailer)
  },

  'sending': {
    beforeEach: function *() {
      this.spy = this.mocker.stub(this.App.mailer._nodeMailer, '_send', () => Q.resolve())
    },

    'sends to nodemailer': function *() {
      const spy = this.spy

      yield this.App.mailer._send({
        to: [this.users.user1, this.users.user2, this.users.user3],
        subject: 'subj',
        body: '**body**',
      })

      const arr = _.map(spy.args || [], (arg) => _.get(arg, '0.to'))
      arr.sort()

      arr.must.eql([
        'user1@waigojs.com',
        'user2@waigojs.com',
        'user3@waigojs.com',
      ])

      _.map(spy.args || [], (arg) => _.get(arg, '0.from')).must.eql([
        'System <waigo@localhost>',
        'System <waigo@localhost>',
        'System <waigo@localhost>',
      ])

      _.map(spy.args || [], (arg) => _.get(arg, '0.replyTo')).must.eql([
        'System <waigo@localhost>',
        'System <waigo@localhost>',
        'System <waigo@localhost>',
      ])

      _.map(spy.args || [], (arg) => _.get(arg, '0.subject')).must.eql([
        'subj',
        'subj',
        'subj',
      ])

      _.get(spy.args, '0.0.html').must.contain('<div><p><strong>body</strong></p>\n</div>')
    },
    'records activity': function *() {
      const spy = this.mocker.spy()

      this.App.on('record', spy)

      yield this.App.mailer._send({
        to: [this.users.user1, this.users.user2, this.users.user3],
        subject: 'subj',
        body: '**body**',
      })

      spy.calledWith('email', this.users.user1, {
        subject: 'subj',
      }).must.be.true()

      spy.calledWith('email', this.users.user2, {
        subject: 'subj',
      }).must.be.true()

      spy.calledWith('email', this.users.user3, {
        subject: 'subj',
      }).must.be.true()
    },
  },

}
