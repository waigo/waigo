"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['models'] = {
  beforeEach: function*() {
    this.createAppModules({
      'models/dummy': 'exports.schema = { name: { type: String } };',
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: ['db'],
      shutdownSteps: ['db'],
    });

    this.setup = waigo.load('support/startup/models');
  },

  afterEach: function*() {
    yield this.clearDb();
    yield this.shutdownApp();
  },

  'loads models': function*() {
    yield this.setup(this.app);

    this.app.models.Dummy.should.be.defined;
  },

  'model methods': function*() {
    yield this.setup(this.app);

    this.app.models.Dummy._app().should.eql(this.app);
    this.app.models.Dummy._logger().info.should.be.a.Function;
  },

  'doc methods': function*() {
    yield this.setup(this.app);

    let doc = yield this.app.models.Dummy.insert({ name: 'James' });

    doc._app().should.eql(this.app);
    doc._logger().info.should.be.a.Function;

    let vo = 
      yield waigo.load('support/viewObjects').toViewObjectYieldable(doc);

    vo.id.should.be.defined;
    vo.name.should.eql('James');
  },

};
