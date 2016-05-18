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



test['database'] = {
  beforeEach: function(done) {
    var self = this;

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        return testUtils.createAppModules({
          'support/db/test': 'module.exports = { create: function*() { return Array.prototype.slice.call(arguments); } }; '
        });
      })
      .then(function() {
        return waigo.initAsync({
          appFolder: testUtils.appFolder
        });
      })
      .then(function() {
        self.setup = waigo.load('support/startup/database');
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

    testUtils.spawn(function*() {
      return yield* self.setup(self.app);
    })
      .then(function() {
        expect(self.app.db).to.be.undefined;
      })
      .nodeify(done);
  },
  'otherwise sets up the db': function(done) {
    var self = this;

    testUtils.spawn(function*() {
      return yield* self.setup(self.app);
    })
      .then(function() {
        self.app.db.should.eql([
          { hello: 'world' }
        ]);
      })
      .nodeify(done);
  }    
};
