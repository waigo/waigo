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
      startupSteps: [],
      shutdownSteps: [],
    });

    middleware = waigo.load('support/middleware/csrf');
  },

  afterEach: function*() {
    yield this.Application.shutdown();
  },

  'csrf': function*() {
    let ctx = {
      response: {},
      request: {},
    };

    let count = 0;
    let next = function*() {
      count++;
    }

    yield middleware().call(ctx, next);

    this.expect(ctx.assertCSRF).to.be.defined;
    this.expect(ctx.request.assertCSRF).to.be.defined;

    count.should.eql(1);
  },

};
