"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var bodyParser = null;


test['body parser'] = {
  beforeEach: function*() {
    yield this.initApp();

    bodyParser = waigo.load('support/middleware/bodyParser');
  },

  'uses co-body': function*() {
    this.expect(bodyParser._bodyParser).to.eql(require('co-body'));
  },

  'parses the body': function*() {
    var ctx = {
      request: {}
    };

    bodyParser._bodyParser = this.mocker.stub().returns({
      dummy: true
    });

    var next = function*() {
      ctx.nextCalled = 1;
    };

    yield bodyParser().call(ctx, next);

    this.expect(ctx.request.body).to.eql({
      dummy: true
    });

    this.expect(ctx.nextCalled).to.eql(1);
  }
};
