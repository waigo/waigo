var path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;

waigo.initAsync = Promise.coroutine(waigo.init);


test['config loader'] = {
  beforeEach: function(done) {
    this.originalMode = process.env.NODE_ENV;

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        var modulesToCreate = {
          'config/base': 'module.exports = { base: 1 };',
          'config/development': 'module.exports = { dev: 1 };',
          'config/random': 'module.exports = { random: 1 };'
        };
        modulesToCreate['config/development.' + process.env.USER] = 'module.exports = { dev_user: 1 };';

        return Promise.all([
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
  }
};
