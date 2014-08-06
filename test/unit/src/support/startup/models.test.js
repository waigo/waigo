var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  utils = _testUtils.utils,
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  waigo = utils.waigo;



test['models'] = {
  beforeEach: function(done) {
    var self = this;

    utils.deleteTestFolders()
      .then(utils.createTestFolders)
      .then(function() {
        utils.createAppModules({
          'models/test1.js': 'module.exports = function(db) { return { modelName: "Black" }; }; ',
          'models/test2.js': 'module.exports = function(db) { return { bla: "White" }; }; '
        })
      })
      .then(function() {
        return waigo.initAsync({
          appFolder: utils.appFolder
        });
      })
      .then(function() {
        self.setup = waigo.load('support/startup/models');
        self.app = waigo.load('application').app;
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    utils.deleteTestFolders().nodeify(done);
  },
  'loads the modules': function(done) {
    var self = this;

    utils.spawn(function*() {
      return yield* self.setup(self.app);
    })
      .then(function() {
        self.app.models.should.eql({
          Black: {
            modelName: 'Black'
          },
          Test2: {
            bla: 'White'
          }
        });
      })
      .nodeify(done);
  }    
};
