"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');

const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var promise;


test['promise'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    promise = waigo.load('support/promise');
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'same as bluebird': function*() {
    promise.should.eql(Q);
  },

  'promisify': {
    beforeEach: function*() {
      this.retVal = null;
      this.retErr = null;

      this.spy = this.mocker.spy((a, cb) => {
        cb(this.retErr, this.retVal);
      });

      this.fn = promise.promisify(this.spy);
    },
    'fail': function*() {
      this.retErr = new Error('test error');

      this.shouldThrow(this.fn(2), 'test error');

      this.spy.should.have.been.calledWith(2);
    },
    'pass': function*() {
      this.retVal = 234;

      let ret = yield this.fn(2);

      this.spy.should.have.been.calledWith(2);
      ret.should.eql(234);
    },
  }
};


