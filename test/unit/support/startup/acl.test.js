"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['acl'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/acl': 'module.exports = { init: function*() { return Array.from(arguments).concat(1); } }; '
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.setup = waigo.load('support/startup/acl');
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'init acl': function*() {
    yield this.setup(this.app);

    this.app.acl.should.eql([this.app, 1]);
  },
};

