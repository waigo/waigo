"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['listener'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.setup = waigo.load('support/startup/listener');

    this.app.listen = this.mocker.stub().returns('abc');
  },
  afterEach: function*() {
    yield this.Application.shutdown();
  },

  'starts HTTP listener': function*() {
    yield this.setup(this.app);

    this.expect(this.app.server).to.eql('abc');

    this.app.listen.should.have.been.calledOnce;
    this.app.listen.should.have.been.calledWithExactly(3000);
  },

  'notifies admins': function*() {
    let spy = this.mocker.spy();

    this.app.events.on('notify', spy);

    yield this.setup(this.app);

    spy.should.have.been.calledOnce;
    spy.should.have.been.calledWith('admins')
    _.get(spy, 'args.0.1').should.contain('listening');
  },
};
