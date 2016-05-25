"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var middleware = null;


test['context helpers'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: ['database', 'models'],
      shutdownSteps: ['database'],
    });

    yield this.clearDb('User');

    middleware = waigo.load('support/middleware/currentUser');
  },

  afterEach: function*() {
    yield this.Application.shutdown();
  },

  'no user': function*() {
    let ctx = {
      session: {},
    };

    let count = 0;
    let next = function*() {
      count++;
    }

    yield middleware().call(ctx, next);

    this.expect(ctx.currentUser).to.not.be.defined;

    count.should.eql(1);
  },

  'has user': function*() {
    let user = yield this.app.models.User.register({
      username: 'test',
    });

    let ctx = {
      app: this.app,
      session: {
        user: {
          id: user.id,
        }
      },
    };

    let count = 0;
    let next = function*() {
      count++;
    }

    yield middleware().call(ctx, next);

    this.expect(ctx.currentUser).to.be.defined;
    ctx.currentUser.toJSON().should.eql(user.toJSON());

    count.should.eql(1);
  },
};
