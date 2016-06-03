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
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.shutdownStep = waigo.load('support/shutdown/acl');
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'shuts down the db': function*() {
    let count = 0;

    this.App.acl = {
      shutdown: function*() {
        count++;
      }
    };

    yield this.shutdownStep(this.App);

    count.should.eql(1);
  }    
};
