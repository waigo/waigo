var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo,
  _ = waigo._;



test['middleware'] = {
  beforeEach: function(done) {
    var self = this;

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        return testUtils.createAppModules({
          'support/middleware/test1': 'module.exports = function(options) { return function*() { return ["test1", options, arguments[0]]; }; };',
          'support/middleware/test2': 'module.exports = function(options) { return function*() { return ["test2", options, arguments[0]]; }; };',
        });
      })
      .then(function() {
        return waigo.initAsync({
          appFolder: testUtils.appFolder
        });
      })
      .then(function() {
        self.setup = waigo.load('support/startup/middleware');
        self.app = waigo.load('application').app;
        self.app.config = self.app.config || {};
        self.app.config.middleware = {
          order: [
            'test1',
            'test2'
          ],
          options: {
            test1: {
              dummy: 'foo'
            },
            test2: {
              dummy: 'bar'
            }
          }
        };
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'loads and initialises middleware': function(done) {
    var self = this;

    var useSpy = test.mocker.spy(self.app, 'use');

    testUtils.spawn(self.setup, self, self.app)
      .then(function() {
        expect(useSpy.callCount).to.eql(2);
      })
      .then(function() {
        fn = useSpy.getCall(0).args[0];

        return testUtils.spawn(fn, null, 128)
          .then(function(val) {
            val.should.eql([ 'test1', { dummy: 'foo' }, 128 ]);
          });
      })
      .then(function() {
        fn = useSpy.getCall(1).args[0];

        return testUtils.spawn(fn, null, 256)
          .then(function(val) {
            val.should.eql([  'test2', { dummy: 'bar' }, 256 ]);
          });
      })
      .nodeify(done);
  }
};
