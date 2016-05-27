"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var middleware = null,
  ctx = null;


test['sessions'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/session/store/testStore': 'module.exports = { create: function(app, cfg) { return cfg; } };'
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    middleware = waigo.load('support/middleware/sessions');
    ctx = {
      request: {},
      query: {},
    };
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'verifies that cookie signing keys are set': function*() {
    this.expect(function() {
      middleware({});
    }).to.throw('Please specify cookie signing keys in the config file.');
  },
  'default': function*() {
    var createStoreSpy = this.mocker.spy(
      waigo.load('support/session/store/testStore'),
      'create'
    );

    var options = { 
      app: this.app,
      keys: ['my', 'key'],
      name: 'sessionName',
      store: {
        type: 'testStore',
        config: {
          hello: 'world'
        }
      },
      cookie: {
        validForDays: 3,
        path: '/blah'
      }
    };

    var fn = middleware(options);

    this.app.keys.should.eql(['my', 'key']);
    createStoreSpy.should.have.been.calledOnce;
    createStoreSpy.should.have.been.calledWithExactly(this.app, {hello: 'world'});
  }
};
