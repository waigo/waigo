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

    this.App.koa.listen = this.mocker.stub().returns('abc');
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },

  'starts HTTP listener': function*() {
    yield this.setup(this.App);

    this.expect(this.App.server).to.eql('abc');

    this.App.koa.listen.should.have.been.calledOnce;
    this.App.koa.listen.should.have.been.calledWithExactly(this.App.config.port);
  },

  'notifies admins': function*() {
    let spy = this.mocker.spy();

    this.App.on('notify', spy);

    yield this.setup(this.App);

    spy.should.have.been.calledOnce;
    spy.should.have.been.calledWith('admins')
    _.get(spy, 'args.0.1').should.contain('listening');
  },
};
