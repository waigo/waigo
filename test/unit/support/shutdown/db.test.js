"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['db'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/db/test1': 'module.exports = { closeAll: function*(logger) { logger.flag.push(1); } }; ',
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
      db: {
        main: {
          type: 'test1',
          hello: 'world2',
        },
        main2: {
          type: 'test1',
          hello: 'world2',
        }        
      }
    });

    this.shutdownStep = waigo.load('support/shutdown/db');

    this.App.logger.flag = [];
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'shuts down the db': function*() {
    this.App.db = {};

    yield this.shutdownStep(this.App);

    this.App.logger.flag.should.eql([1]);
  }    
};
