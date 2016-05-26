"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


test['console'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: ['db', 'models', 'mailer', 'appTemplateVars'],
      shutdownSteps: ['db'],
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

    this.Base = waigo.load('support/mailer/base');
    this.Console = waigo.load('support/mailer/console').Console;
  },

  afterEach: function*() {
    yield this.clearDb();
    
    yield this.Application.shutdown();
  },

  'app.mailer instance': function*() {
    this.app.mailer.should.be.instanceof(this.Console);
    this.app.mailer.should.be.instanceof(this.Base);
  },

  'send calls to base class': function*() {
    let spy = this.mocker.stub(this.app.mailer, '_send', () => Q.resolve());

    yield this.app.mailer.send(123);

    spy.should.have.been.calledWith(123);
  },

};


