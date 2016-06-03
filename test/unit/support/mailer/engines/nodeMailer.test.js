"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');

const nodemailerStubTransport = require('nodemailer-stub-transport');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


test['nodemailer'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });
    
    this.NodeMailer = waigo.load('support/mailer/engines/nodeMailer').NodeMailer;

    this.mailer = new this.NodeMailer(this.App.logger, null, nodemailerStubTransport());

    this.mailer._send = this.mocker.spy(() => Q.resolve());
  },

  afterEach: function*() {
    yield this.clearDb();
    
    yield this.shutdownApp();
  },

  'sets replyTo': function*() {
    yield this.mailer.send({
      to: 'test@waigojs.com',
      from: 'admin@waigojs.com',
      text: 'hello1',
    });

    yield this.mailer.send({
      to: 'test@waigojs.com',
      replyTo: 'abcd@waigojs.com',
      from: 'admin@waigojs.com',
      text: 'hello1',
    });

    _.get(this.mailer._send.args, '0.0.replyTo', '').should.eql('admin@waigojs.com');
    _.get(this.mailer._send.args, '1.0.replyTo', '').should.eql('abcd@waigojs.com');
  },

  'only html': function*() {
    yield this.mailer.send({
      to: 'test@waigojs.com',
      from: 'admin@waigojs.com',
      html: 'hello1',
    });

    _.get(this.mailer._send.args, '0.0.html', '').should.eql('hello1');
    _.get(this.mailer._send.args, '0.0.text', 'nf').should.eql('nf');
  },

  'text and html': function*() {
    yield this.mailer.send({
      to: 'test@waigojs.com',
      from: 'admin@waigojs.com',
      text: 'text2',
      html: 'hello1',
    });

    _.get(this.mailer._send.args, '0.0.html', '').should.eql('hello1');
    _.get(this.mailer._send.args, '0.0.text', '').should.eql('text2');
  },
};


