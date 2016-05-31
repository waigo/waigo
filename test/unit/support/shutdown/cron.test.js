"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['cron'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.shutdownStep = waigo.load('support/shutdown/cron');

    this.app.cron = {
      test: {
        stopScheduler: () => {
          this.app.count++;
        }
      },
      test2: {
        stopScheduler: () => {
          this.app.count++;
        }
      },
    };

    this.app.count = 0;
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'stops cron job': function*() {
    yield this.shutdownStep(this.app);

    this.app.count.should.eql(2);
  }    
};
