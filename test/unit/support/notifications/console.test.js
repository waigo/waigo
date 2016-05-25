"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const log4js = require('log4js');

const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var notifier = null;


test['console notifier'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
      logging: {
        category: "test",
        minLevel: 'DEBUG',
        appenders: [],
      }, 
    });

    this.log = [];

    log4js.addAppender((msg) => {
      this.log.push(msg);
    });

    notifier = waigo.load('support/notifications/console');
  },

  afterEach: function*() {
    yield this.Application.shutdown();
  },

  'string': function*() {
    let fn = yield notifier(this.app, 'test1');

    yield fn('dummydave');

    let logEvent = this.log.pop();

    _.get(logEvent, 'categoryName').should.eql('ConsoleNotifier/test1');
    _.get(logEvent, 'data').should.eql(['dummydave']);
  },

  'object': function*() {
    let fn = yield notifier(this.app, 'test1');

    let data = { test: 'dummydave', abc: 2 };

    yield fn(data);

    let logEvent = this.log.pop();

    _.get(logEvent, 'categoryName').should.eql('ConsoleNotifier/test1');
    _.get(logEvent, 'data').should.eql([ JSON.stringify(data) ]);
  },
};



