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
    yield this.shutdownApp();
  },
  'sets template vars': function*() {
    this.App.routes = 'blah';
    this.App.staticUrl = 'blah2';

    yield this.setup(this.App);

    this.App.templateVars.should.eql({
      _: _,
      routeUrl: 'blah',
      staticUrl: 'blah2',
      config: this.App.config,
    });
  },
};

