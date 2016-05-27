"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['mailer'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/mailer/test': 'exports.create = function*() { return Array.from(arguments); }',
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.setup = waigo.load('support/startup/mailer');
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'mailer config not set': function*() {
    this.app.config.mailer = null;

    yield this.shouldThrow(this.setup(this.app), 'Mailer type not set');
  },
  'mailer type invalid': function*() {
    this.app.config.mailer = { type: 'invalid' };

    yield this.shouldThrow(this.setup(this.app), 'File not found');
  },
  'mailer type valid': function*() {
    this.app.config.mailer = { type: 'test', dummy: true };

    yield this.setup(this.app);

    this.app.mailer.should.eql([ this.app, { type: 'test', dummy: true } ]);
  },
};

