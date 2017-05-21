const _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird')

const nodemailerStubTransport = require('nodemailer-stub-transport')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['nodemailer'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.NodeMailer = this.waigo.load('mailer/support/engines/nodeMailer').NodeMailer

    this.mailer = new this.NodeMailer(this.App.logger, null, nodemailerStubTransport())

    this.mailer._send = this.mocker.spy(() => Q.resolve())
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'sets replyTo': function *() {
    yield this.mailer.send({
      to: 'test@waigojs.com',
      from: 'admin@waigojs.com',
      text: 'hello1',
    })

    yield this.mailer.send({
      to: 'test@waigojs.com',
      replyTo: 'abcd@waigojs.com',
      from: 'admin@waigojs.com',
      text: 'hello1',
    })

    _.get(this.mailer._send.args, '0.0.replyTo', '').must.eql('admin@waigojs.com')
    _.get(this.mailer._send.args, '1.0.replyTo', '').must.eql('abcd@waigojs.com')
  },

  'only html': function *() {
    yield this.mailer.send({
      to: 'test@waigojs.com',
      from: 'admin@waigojs.com',
      html: 'hello1',
    })

    _.get(this.mailer._send.args, '0.0.html', '').must.eql('hello1')
    _.get(this.mailer._send.args, '0.0.text', 'nf').must.eql('nf')
  },

  'text and html': function *() {
    yield this.mailer.send({
      to: 'test@waigojs.com',
      from: 'admin@waigojs.com',
      text: 'text2',
      html: 'hello1',
    })

    _.get(this.mailer._send.args, '0.0.html', '').must.eql('hello1')
    _.get(this.mailer._send.args, '0.0.text', '').must.eql('text2')
  },
}
