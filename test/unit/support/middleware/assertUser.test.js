"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var assertUser = null;


test['assert user'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: ['routes'],
      shutdownSteps: [],
    });

    this.ctx = {
      App: this.App,
    };

    assertUser = waigo.load('support/middleware/assertUser');
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'user must be logged in': function*() {
    yield this.shouldThrow(
      assertUser({}).call(this.ctx, Q.resolve()), 
      'You must be logged in'
    );
  },

  'check if can access': function*() {
    let spy = this.mocker.spy(() => Q.resolve());

    this.ctx.currentUser = {
      assertAccess: spy,
    };
    
    yield assertUser({canAccess: 'admin'}).call(this.ctx, Q.resolve());

    spy.should.have.been.calledWithExactly('admin');
  },

  'calls next if ok': function*() {
    let count = 0;

    this.ctx.currentUser = {};

    yield assertUser({}).call(this.ctx, function*() {
      count++;
    });

    count.should.eql(1);
  },

  'fail - redirect': function*() {
    _.extend(this.ctx, {
      currentUser: {
        assertAccess: function*() {
          throw new Error('blah');
        }
      },
      request: {
        url: 'test2'
      },
      redirect: this.mocker.spy(() => Q.resolve()),
    });

    let routeSpy = this.mocker.spy(this.App.routes, 'url');

    yield assertUser({ 
      redirectToLogin: true, 
      canAccess: 'admin' 
    }).call(this.ctx);

    routeSpy.should.have.been.calledWithExactly('user_login', null, {
      r: 'blah',
      u: 'test2',
    });

    this.ctx.redirect.should.have.been.calledWithExactly(
      routeSpy.getCall(0).returnValue
    );
  },


  'fail - no redirect': function*() {
    _.extend(this.ctx, {
      currentUser: {
        assertAccess: function*() {
          throw new Error('blah');
        }
      },
    });

    yield this.shouldThrow(assertUser({ 
      canAccess: 'admin' 
    }).call(this.ctx), 'blah');
  },
};
