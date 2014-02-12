var path = require('path'),
  Promise = require('bluebird'),
  waigo = require('../../index');

var testBase = require('../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module);


waigo.initAsync = Promise.coroutine(waigo.init);


test['app folder'] = {
  beforeEach: function() {
    waigo.__modules = null;
  },
  'get': function() {
    expectedAppFolder = path.join(path.dirname(process.argv[1]), 'src');
    waigo.getAppFolder().should.eql(expectedAppFolder);
  }
};



test['init()'] = {
  beforeEach: function(done) {
    waigo.__modules = null;

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function createPlugins() {
        return Promise.all([
          testUtils.createPlugin('waigo-plugin-1'),
          testUtils.createPlugin('waigo-plugin-2'),
          testUtils.createPlugin('another-plugin')
        ]);
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'can only be called once': function(done) {
    waigo.initAsync()
      .then(function secondTime() {
        return new Promise(function(resolve, reject) {
          waigo.initAsync()
            .then(function oops() {
              throw new Error('Should not be here');
            })
            .catch(function(err) {
              err.toString().should.eql('Error: Waigo already inititialised');            
              resolve();
            });
        });
      })
      .nodeify(done);
  },
  'set app folder': function(done) {
    waigo.getAppFolder().should.not.eql(testUtils.appFolder);

    waigo.initAsync({
      appFolder: testUtils.appFolder
    })
      .then(function() {
        waigo.getAppFolder().should.eql(testUtils.appFolder);
      })
      .nodeify(done);
  },
  // 'default plugins': function() {
  //   waigo.initAsync({
  //     config: {
  //       dependencies: ['waigo-plugin-1', 'merry-go-round'],
  //       devDependencies: ['merry-go-round-2', 'waigo-plugin-2', 'waigo-plugin-2'],  // deliberate duplicate
  //       peerDependencies: ['bla-bla', 'another-plugin'],
  //     }
  //   })
  //     .then(function checkLoadedPlugins() {
  //       waigo.__modules.should.eql
  //     })
  //     .nodeify(done);
  // }
};



test['load()'] = {
  beforeEach: function() {
    waigo.__modules = null;
  },
  'fails if not inititialised': function(done){
    try {
      waigo.load();
      throw new Error('Shouldn\'t be here');
    } catch (err) {
      err.toString().should.eql('Error: Please initialise Waigo first');
      done();
    }
  }
}



