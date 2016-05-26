"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['app template vars'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.setup = waigo.load('support/startup/appTemplateVars');
  },
  afterEach: function*() {
    yield this.Application.shutdown();
  },
  'sets template vars': function*() {
    this.app.routeUrl = 'blah';
    this.app.staticUrl = 'blah2';

    yield this.setup(this.app);

    this.app.templateVars.should.eql({
      _: _,
      routeUrl: this.app.routeUrl,
      staticUrl: this.app.staticUrl,
      config: this.app.config,
    });
  },
};

