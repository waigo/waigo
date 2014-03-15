var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;



test['middleware'] = {
  beforeEach: function(done) {
    var self = this;

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        testUtils.createAppModules({
          'support/middleware/test': 'module.exports = function(options) { return function*() { return ["test", options, arguments[0]]; }; };',
          'support/middleware/test2': 'module.exports = function(options) { return function*() { return ["test2", options, arguments[0]]; }; };',
        })
      })
      .then(function() {
        return waigo.initAsync({
          appFolder: testUtils.appFolder
        });
      })
      .then(function() {
        self.setup = waigo.load('support/startup/middleware');
        self.app = waigo.load('app');
        self.app.config.middleware = [
          {
            id: 'test',
            options: 'foo'
          },
          {
            id: 'test2',
            options: 'bar'
          }
        ];
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'loads and initialises middleware': function(done) {
    var self = this;

    var useSpy = test.mocker.spy(self.app, 'use');

    testUtils.spawn(function*() {
      yield* self.setup(self.app);
    })
      .then(function() {
        expect(useSpy.callCount).to.eql(2);
      })
      .then(function() {
        fn = useSpy.getCall(0).args[0];

        testUtils.spawn(function*() {
          return yield fn.call(null, 128);
        })
          .then(function(val) {
            val.should.eql([ 'test', 'foo', 128 ]);
          });
      })
      .then(function() {
        fn = useSpy.getCall(1).args[0];

        testUtils.spawn(function*() {
          return yield fn.call(null, 256);
        })
          .then(function(val) {
            val.should.eql([  'test2', 'bar', 256 ]);
          });
      })
      .nodeify(done);
  }
};
