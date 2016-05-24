"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


test['notify admins about user stats'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: ['database', 'models', 'mailer', 'appTemplateVars'],
      shutdownSteps: ['database'],
      mailer: {
        type: 'console',
        from: 'test@waigojs.com',
      },
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

    this.Console = waigo.load('support/mailer/console').Console;
    this.NodeMailer = waigo.load('support/mailer/engines/nodeMailer').NodeMailer;
  },

  afterEach: function*() {
    yield this.clearDb();
    
    yield this.Application.shutdown();
  },

  'app.mailer instance': function*() {
    this.app.mailer.should.be.instanceof(this.Console);
  },

  'got NodeMailer instance': function*() {
    this.app.mailer._nodeMailer.should.be.instanceof(this.NodeMailer);
  },

  'sends to nodemailer': function*() {
    let spy = this.mocker.stub(this.app.mailer._nodeMailer, '_send', () => Q.resolve());

    yield this.app.mailer.send({
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
      'test@waigojs.com',
      'test@waigojs.com',
      'test@waigojs.com',
    ]); 

    _.map(spy.args || [], (arg) => _.get(arg, '0.replyTo')).should.eql([
      'test@waigojs.com',
      'test@waigojs.com',
      'test@waigojs.com',
    ]); 

    _.map(spy.args || [], (arg) => _.get(arg, '0.subject')).should.eql([
      'subj',
      'subj',
      'subj',
    ]);

    _.get(spy.args, '0.0.html').should.contain('<div><p><strong>body</strong></p>\n</div>');
  },

};


