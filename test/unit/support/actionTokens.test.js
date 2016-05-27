"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['action tokens'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: ['db', 'models'],
      shutdownSteps: ['db'],
    });

    yield this.clearDb();

    this.users = yield {
      john: this.app.models.User.register({
        username: 'john'
      }),
      mark: this.app.models.User.register({
        username: 'mark',
      }),
    };

    this.inst = yield waigo.load('support/actionTokens').init(this.app, {
      validForSeconds: 2,
      encryptionKey: 'test',
    });
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'default - create and process': function*() {
    let token = yield this.inst.create('confirm', this.users.john, {
      dummy: true,
    });

    token.should.be.a.string;

    let ret = yield this.inst.process(token);

    ret.type.should.eql('confirm');
    ret.user.id.should.eql(this.users.john.id);
    ret.data.should.eql({dummy: true});
  },
  'records activity': function*() {
    let token = yield this.inst.create('confirm', this.users.john, {
      dummy: true,
    });

    yield this.inst.process(token);

    let activity = yield this.app.models.Activity.getLatest(
      'action_token_processed', this.users.john.id
    );

    activity.should.be.defined;
    activity.details.type.should.eql('confirm');
  },
  'override validity period': function*() {
    let token = yield this.inst.create('confirm', this.users.john, {
      dummy: true,
    }, {
      validForSeconds: 0,
    });

    yield Q.delay(10);

    yield this.shouldThrow(this.inst.process(token), 'This action token has expired');
  },
  'when got token': {
    beforeEach: function*() {
      this.token = yield this.inst.create('confirm', this.users.john);
    },

    'parse error': function*() {
      this.token += 'a';

      yield this.shouldThrow(this.inst.process(this.token), 'Error parsing action token');
    },

    'type mismatch': function*() {
      yield this.shouldThrow(this.inst.process(this.token, {
        type: 'blah'
      }), 'Action token type mismatch: confirm');
    },

    'expired': function*() {
      yield Q.delay(2001);

      yield this.shouldThrow(this.inst.process(this.token), 'This action token has expired');
    },

    'user not found': function*() {
      yield this.clearDb('User');

      yield this.shouldThrow(this.inst.process(this.token), 'Unable to find user information related to action token');
    },

    'already processed': function*() {
      yield this.inst.process(this.token);

      yield this.shouldThrow(this.inst.process(this.token), 'This action token has already been processed and is no longer valid');
    },
  },
};

