"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['database'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/db/test': 'module.exports = { create: function*() { return Array.prototype.slice.call(arguments); }, closeAll: function*(logger) { logger.flag += "1"; } }; ',
      'support/db/test2': 'module.exports = { create: function*() { return Array.prototype.slice.call(arguments); }, closeAll: function*(logger) { logger.flag += "2"; } }; ',
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
      db: {
        test: {
          hello: 'world'
        }
      }
    });

    this.shutdownStep = waigo.load('support/shutdown/database');

    this.app.logger.flag = '';
  },
  afterEach: function*() {
    this.Application.shutdown();
  },
  'shuts down the db': function*() {
    this.app.db = {};

    yield this.shutdownStep(this.app);

    this.app.logger.flag.should.eql('12');
  }    
};
