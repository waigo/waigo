"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['activity recorder'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: ['db', 'models'],
      shutdownSteps: ['db'],
    });

    yield this.clearDb('User', 'Activity');

    this.user = yield this.App.models.User.register({
      username: 'test',
    });

    this.setup = waigo.load('support/startup/activityRecorder');
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'init action tokens': function*() {
    yield this.setup(this.App);

    this.App.emit('record', 'test', this.user, {
      dummy: true
    });

    yield Q.delay(10);

    let activities = yield this.App.models.Activity.rawQry().run();

    _.get(activities, '0.verb').should.eql('test');
    _.get(activities, '0.details').should.eql({dummy: true});
  },
};

