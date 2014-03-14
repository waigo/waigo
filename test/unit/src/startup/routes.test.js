var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;



test['routes'] = {
  beforeEach: function(done) {
    var self = this;

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        testUtils.createAppModules({
          'routes': 'module.exports = { "GET /": "test.index" };',
          'support/routeMapper': 'module.exports = { map: function() {} };'
        })
      })
      .then(function() {
        return waigo.initAsync({
          appFolder: testUtils.appFolder
        });
      })
      .then(function() {
        self.setup = waigo.load('startup/routes');
        self.app = waigo.load('server');
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'loads routes': function(done) {
    var self = this;

    testUtils.spawn(function*() {
      return yield* self.setup(self.app);
    })
      .then(function() {
        self.app.routes.should.eql({
          'GET /': 'test.index'
        });
      })
      .nodeify(done);
  },
  'maps routes': function(done) {
    var self = this;

    var routeMapper = waigo.load('support/routeMapper'),
      mapSpy = test.mocker.spy(routeMapper, 'map');

    testUtils.spawn(function*() {
      return yield* self.setup(self.app);
    })
      .then(function() {
        mapSpy.should.have.been.calledOnce;
        mapSpy.should.have.been.calledWithExactly(self.app, self.app.routes);
      })
      .nodeify(done);
  },
  'enables Koa router': function(done) {
    var self = this;

    var appUseSpy = test.mocker.spy(self.app, 'use');

    testUtils.spawn(function*() {
      return yield* self.setup(self.app);
    })
      .then(function() {
        appUseSpy.should.have.been.calledOnce;
        appUseSpy.should.have.been.calledWithExactly(self.app.router);
      })
      .nodeify(done);
  }
};
