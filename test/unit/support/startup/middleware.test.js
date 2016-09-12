"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['middleware'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/middleware/test1': 'module.exports = function(App, options) { return function*() { return ["test1", options, arguments[0]]; }; };',
      'support/middleware/test2': 'module.exports = function(App, options) { return function*() { return ["test2", options, arguments[0]]; }; };',
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.App.config.middleware.ALL = {
      _order: [
        'test1',
        'test2'
      ],
      test1: {
        dummy: 'foo'
      },
      test2: {
        dummy: 'bar'
      }
    };

    this.setup = waigo.load('support/startup/middleware');
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },

  'loads and initialises middleware': function*() {
    let useSpy = this.mocker.spy(this.App.koa, 'use');

    yield this.setup(this.App);

    useSpy.callCount.should.eql(2);

    let fn = useSpy.getCall(0).args[0];

    let val = yield fn(128);

    val.should.eql([ 'test1', { dummy: 'foo' }, 128 ]);

    fn = useSpy.getCall(1).args[0];

    val = yield fn(256);

    val.should.eql([  'test2', { dummy: 'bar' }, 256 ]);
  }
};
