var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;



test['database'] = {
  beforeEach: function(done) {
    var self = this;

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        return testUtils.createAppModules({
          'support/db/test': 'module.exports = { create: function*() { return Array.prototype.slice.call(arguments); }, shutdown: function*(db) { db.shutdown = true; } }; '
        });
      })
      .then(function() {
        return waigo.initAsync({
          appFolder: testUtils.appFolder
        });
      })
      .then(function() {
        self.shutdownStep = waigo.load('support/shutdown/database');
        self.app = waigo.load('application').app;
        self.app.config = {
          db: {
            test: {
              hello: 'world'
            }
          }
        };
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'does nothing if no config': function(done) {
    var self = this;

    delete self.app.config.db;
    self.app.db = {};

    testUtils.spawn(function*() {
      return yield* self.shutdownStep(self.app);
    })
      .then(function() {
        expect(self.app.db.shutdown).to.not.be.true;
      })
      .nodeify(done);
  },
  'otherwise shuts down the db': function(done) {
    var self = this;

    self.app.db = {};

    testUtils.spawn(function*() {
      return yield* self.shutdownStep(self.app);
    })
      .then(function() {
        self.app.db.shutdown.should.be.true;
      })
      .nodeify(done);
  }    
};
