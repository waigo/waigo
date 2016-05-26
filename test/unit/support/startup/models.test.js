var moment = require('moment'),
  path = require('path'),
  Q = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  utils = _testUtils.utils,
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  waigo = utils.waigo;



test['models'] = {
  beforeEach: function*() {
    

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
        this.setup = waigo.load('support/startup/models');
        this.app = waigo.load('application').app;
      })
      .nodeify(done);
  },
  afterEach: function*() {
    utils.deleteTestFolders().nodeify(done);
  },
  'loads the modules': function*() {
    

    utils.spawn(function*() {
      return yield* this.setup(this.app);
    })
      .then(function() {
        this.app.models.should.eql({
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
