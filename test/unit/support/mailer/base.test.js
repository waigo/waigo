"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


test['base'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: ['db', 'models', 'mailer', 'appTemplateVars'],
      shutdownSteps: ['db'],
    });
    
    yield this.clearDb('User');

    // lets insert some users
    this.users = yield {
      user1: this.app.models.User.register({
        username: 'user1',
        email: 'user1@waigojs.com',
      }),
      user2: this.app.models.User.register({
        username: 'user2',
        email: 'user2@waigojs.com',
      }),
      user3: this.app.models.User.register({
        username: 'user3',
        email: 'user3@waigojs.com',
      }),
    };

    this.MailerBase = waigo.load('support/mailer/base');
    this.NodeMailer = waigo.load('support/mailer/engines/nodeMailer').NodeMailer;
  },

  afterEach: function*() {
    yield this.clearDb();
    
    yield this.Application.shutdown();
  },

  'app.mailer instance': function*() {
    this.app.mailer.should.be.instanceof(this.MailerBase);
  },

  'rendering': {
    'need recipients': function*() {
      yield this.shouldThrow(this.app.mailer.render(), 'Recipients must be set');
    },

    'need subject and body': function*() {
      yield this.shouldThrow(this.app.mailer.render({
        to: 'test@waigojs.com'
      }), 'Subject and body/template must be set');
    },

    'markdown': function*() {
      let ret = yield this.app.mailer.render({
        to: this.users.user1,
        body: '**This** _is_ markdown',
        subject: '**This** _is_ not markdown',
      });

      _.get(ret, 'body').should.eql(
        '<p>user1,</p><div><p><strong>This</strong> <em>is</em> markdown</p>\n</div><p>thanks,<br />Waigo administrators</p>'
      );
      _.get(ret, 'subject').should.eql('**This** _is_ not markdown');
    },

    'body template': function*() {
      let ret = yield this.app.mailer.render({
        to: this.users.user1,
        bodyTemplate: 'passwordUpdated',
        subject: 'subj',
      });

      _.get(ret, 'body').should.contain('user1,');
      _.get(ret, 'body').should.contain('Waigo administrators');
      _.get(ret, 'body').should.contain('successfully reset your password');
    },

    'use email address instead': function*() {
      let ret = yield this.app.mailer.render({
        to: 'user1@waigojs.com',
        bodyTemplate: 'passwordUpdated',
        subject: 'subj',
      });

      _.get(ret, 'body').should.contain('Hey,');
      _.get(ret, 'body').should.contain('Waigo administrators');
      _.get(ret, 'body').should.contain('successfully reset your password');
    },
  },

  'got NodeMailer instance': function*() {
    this.app.mailer._nodeMailer.should.be.instanceof(this.NodeMailer);
  },

  'sending': {
    beforeEach: function*() {
      this.spy = this.mocker.stub(this.app.mailer._nodeMailer, '_send', () => Q.resolve());
    },

    'sends to nodemailer': function*() {
      let spy = this.spy;

      yield this.app.mailer._send({
        to: [this.users.user1, this.users.user2, this.users.user3],
        subject: 'subj',
        body: '**body**',
      });

      _.map(spy.args || [], (arg) => _.get(arg, '0.to')).should.eql([
        'user1@waigojs.com', 
        'user2@waigojs.com',
        'user3@waigojs.com',
      ]); 

      _.map(spy.args || [], (arg) => _.get(arg, '0.from')).should.eql([
        'System <waigo@localhost>',
        'System <waigo@localhost>',
        'System <waigo@localhost>',
      ]); 

      _.map(spy.args || [], (arg) => _.get(arg, '0.replyTo')).should.eql([
        'System <waigo@localhost>',
        'System <waigo@localhost>',
        'System <waigo@localhost>',
      ]); 

      _.map(spy.args || [], (arg) => _.get(arg, '0.subject')).should.eql([
        'subj',
        'subj',
        'subj',
      ]);

      _.get(spy.args, '0.0.html').should.contain('<div><p><strong>body</strong></p>\n</div>');
    },
    'records activity': function*() {
      let spy = this.mocker.spy();

      this.app.events.on('record', spy);

      yield this.app.mailer._send({
        to: [this.users.user1, this.users.user2, this.users.user3],
        subject: 'subj',
        body: '**body**',
      });

      spy.should.have.been.calledWith('email', this.users.user1, {
        subject: 'subj',
      });
      spy.should.have.been.calledWith('email', this.users.user2, {
        subject: 'subj',
      });
      spy.should.have.been.calledWith('email', this.users.user3, {
        subject: 'subj',
      });
    },
  },

};
