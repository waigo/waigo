var path = require('path'),
  Q = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


test['config loader'] = {
  beforeEach: function(done) {
    this.originalMode = process.env.NODE_ENV;

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        var modulesToCreate = {
          'config/base': 'module.exports = function(config) { config.base = 1 };',
          'config/development': 'module.exports = function(config) { config.dev = 1 };',
          'config/random': 'module.exports = function(config) { config.random = 1 };',
          'config/error': 'module.exports = function(config) { throw new Error("haha") };'
        };
        modulesToCreate['config/development.' + process.env.USER] = 'module.exports = function(config) { config.dev_user = 1 };';

        return Q.all([
          testUtils.createAppModules(modulesToCreate)
        ]);
      })
      .then(function() {
        return waigo.initAsync({
          appFolder: testUtils.appFolder
        });
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    process.env.NODE_ENV = this.originalMode;
    testUtils.deleteTestFolders().nodeify(done);
  },
  'defaults': function() {
    process.env.NODE_ENV = 'development';

    waigo.load('config/index')().should.eql({
      mode: 'development',
      user: process.env.USER,
      base: 1,
      dev: 1,
      dev_user: 1
    });
  },
  'set mode': function() {
    process.env.NODE_ENV = 'random';

    var config = waigo.load('config/index');

    waigo.load('config/index')().should.eql({
      mode: 'random',
      user: process.env.USER,
      base: 1,
      random: 1
    });
  },
  'set bad mode': function() {
    process.env.NODE_ENV = 'notfound';

    var config = waigo.load('config/index');

    waigo.load('config/index')().should.eql({
      mode: 'notfound',
      user: process.env.USER,
      base: 1
    });
  },
  'error in config file': function() {
    process.env.NODE_ENV = 'error';

    var config = waigo.load('config/index');

    expect(waigo.load('config/index')).to.throw('haha');
  }
};
