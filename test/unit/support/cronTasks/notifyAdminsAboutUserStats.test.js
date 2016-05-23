"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


test['notify admins about user stats'] = {
  beforeEach: function*() {
    yield this.initApp();
    yield this.startApp({
      startupSteps: ['database', 'models'],
      shutdownSteps: ['database'],
    });
    yield this.clearDb('User');

    this.ctx = {
      app: this.app,
    };

    this.task = waigo.load('support/cronTasks/notifyAdminsAboutUserStats');
  },

  afterEach: function*() {
    yield this.Application.shutdown();
  },

  'schedule': function*() {
    this.expect(this.task.schedule).to.eql('0 0 3 * * 1');
  },

  // 'handler': {
  //   'when no admins': 
  //   'when no recent new users':
  //   'when all set':

  // },


};
