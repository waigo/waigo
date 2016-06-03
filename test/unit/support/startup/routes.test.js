"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['routes'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/routeMapper': 'exports.setup = function*() { return arguments; };'
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
      middleware: {
        dummy: true,
      },
    });

    this.setup = waigo.load('support/startup/routes');
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'loads routes': function*() {
    yield this.setup(this.App);

    let routesToLoad = _.reduce(waigo.getItemsInFolder('routes'), (soFar, n) => {
      return _.merge(soFar, waigo.load(n));      
    }, {});

    _.get(this.App, 'routes.2').should.eql(routesToLoad);
    _.get(this.App, 'routes.1').should.eql({ dummy: true });
    _.get(this.App, 'routes.0').should.eql(this.App);
  },

};
