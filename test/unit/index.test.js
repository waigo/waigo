var _ = require('lodash'),
  path = require('path'),
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
    expectedAppFolder = path.join(process.cwd(), 'src');
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
          testUtils.createPluginModules('waigo-plugin-1_TESTPLUGIN'),
          testUtils.createPluginModules('waigo-plugin-2_TESTPLUGIN'),
          testUtils.createPluginModules('another-plugin_TESTPLUGIN')
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
  'get plugin names': {
    beforeEach: function() {
      this.options = {
        plugins: {
          config: {
            dependencies: {
              'waigo-plugin-1_TESTPLUGIN': '0.0.1',
            },
            devDependencies: {
              'waigo-plugin-2_TESTPLUGIN': '0.0.1',
              'waigo-plugin-2_TESTPLUGIN': '0.0.1'  // deliberately testing duplicates
            },
            peerDependencies: {
              'another-plugin_TESTPLUGIN': '0.0.1'
            }
          }
        }
      };
    },
    'default options': function(done) {
      var options = {};

      waigo.initAsync(options)
        .then(function checkLoadedPlugins() {
          options.plugins.names.should.eql([]);
        })
        .nodeify(done);
    },
    'custom config': function(done) {
      var options = this.options;

      waigo.initAsync(options)
        .then(function checkLoadedPlugins() {
          options.plugins.names.should.eql(['waigo-plugin-1_TESTPLUGIN', 'waigo-plugin-2_TESTPLUGIN']);
        })
        .nodeify(done);
    },
    'custom globbing pattern': function(done) {
      var options = this.options;
      options.plugins.glob = ['*another*'];

      waigo.initAsync(options)
        .then(function checkLoadedPlugins() {
          options.plugins.names.should.eql(['another-plugin_TESTPLUGIN']);
        })
        .nodeify(done);
    },
    'custom scope': function(done) {
      var options = this.options;
      options.plugins.configKey = ['peerDependencies'];

      waigo.initAsync(options)
        .then(function checkLoadedPlugins() {
          options.plugins.names.should.eql([]);
        })
        .nodeify(done);
    },
    'directly specified': function(done) {
      var options = {
        plugins: {
          names: ['another-plugin_TESTPLUGIN']
        }
      }

      waigo.initAsync(options)
        .then(function checkLoadedPlugins() {
          options.plugins.names.should.eql(['another-plugin_TESTPLUGIN']);
        })
        .nodeify(done);      
    }
  },
  'module path resolution': {

  }
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



