"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


test['shutdown listener'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.step = waigo.load('support/shutdown/listener');

    this.app.confifg = {
      mode: 'test',
      port: 3000,
      baseURL: 'http://dummy:4334'
    };
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'shuts down HTTP listener': function*() {
    var closed = 0;

    this.app.server = {
      close: function(cb) {
        closed += 1;
        cb();
      }
    };

    yield this.step.call(this.step, this.app);

    closed.should.eql(1);
  }

};
