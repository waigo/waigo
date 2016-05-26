var moment = require('moment'),
  path = require('path'),
  Q = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;



test['routes'] = {
  beforeEach: function*() {
    

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
        this.setup = waigo.load('support/startup/routes');
        this.app = waigo.load('application').app;
      })
      .nodeify(done);
  },
  afterEach: function*() {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'loads routes': function*() {
    

    testUtils.spawn(function*() {
      return yield* this.setup(this.app);
    })
      .then(function() {
        this.app.routes.should.eql({
          'GET /': 'test.index'
        });
      })
      .nodeify(done);
  },
  'maps routes': function*() {
    

    var routeMapper = waigo.load('support/routeMapper'),
      mapSpy = test.mocker.spy(routeMapper, 'map');

    testUtils.spawn(function*() {
      return yield* this.setup(this.app);
    })
      .then(function() {
        mapSpy.should.have.been.calledOnce;
        mapSpy.should.have.been.calledWithExactly(this.app, this.app.routes);
      })
      .nodeify(done);
  },
  'enables Koa router': function*() {
    

    var appUseSpy = test.mocker.spy(this.app, 'use');

    testUtils.spawn(function*() {
      return yield* this.setup(this.app);
    })
      .then(function() {
        appUseSpy.should.have.been.calledOnce;
        appUseSpy.should.have.been.calledWithExactly(this.app.router);
      })
      .nodeify(done);
  }
};
