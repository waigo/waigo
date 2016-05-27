"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['notifications'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/notifications/test1': 'module.exports = function(app, id, cfg) { return function*() { app.count1.push(arguments); } };',
      'support/notifications/test2': 'module.exports = function(app, id, cfg) { return function*() { app.count2.push(arguments); } };',
      'support/notifications/test3': 'module.exports = function(app, id, cfg) { return function*() { app.count3.push(arguments); } };',
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.setup = waigo.load('support/startup/notifications');

    this.app.count1 = [];
    this.app.count2 = [];
    this.app.count3 = [];
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'invalid types': function*() {
    this.app.config.notifications = {
      admins: {
        transports: [{ type: 'invalid' }]
      }
    };

    yield this.shouldThrow(this.setup(this.app), 'File not found: support/notifications/invalid');
  },

  'valid types': function*() {
    this.app.config.notifications = {
      admins: {
        transports: [{ type: 'test1'}, { type: 'test2'}]
      },
      admins2: {
        transports: [{ type: 'test3'}]
      },
    };

    yield this.setup(this.app);

    this.app.emit('notify', 'admins', 'test');
    this.app.emit('notify', 'admins2', 'test2');

    this.app.count1.should.eql['test'];
    this.app.count2.should.eql['test'];
    this.app.count3.should.eql['test2'];
  },

};
