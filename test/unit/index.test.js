var _ = require('lodash'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


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

    this.options = {
      appFolder: testUtils.appFolder,
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
  'can only be called more than once': function(done) {
    waigo.initAsync()
      .then(waigo.initAsync)
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
    'default version': function(done) {
      var options = this.options;

      waigo.initAsync(options)
        .then(function checkLoadedPlugins() {
          waigo.__modules['support/errors']._load.should.eql('waigo');
        })
        .nodeify(done);      
    },
    'app overrides default': function(done) {
      var options = this.options;

      testUtils.createAppModules(['support/errors'])
        .then(function() {
          return waigo.initAsync(options)
            .then(function checkLoadedPlugins() {
              waigo.__modules['support/errors']._load.should.eql('app');
            });
        })
        .nodeify(done);      
    },
    'app version only': function(done) {
      var options = this.options;

      testUtils.createAppModules(['support/blabla'])
        .then(function() {
          return waigo.initAsync(options)
            .then(function checkLoadedPlugins() {
              waigo.__modules['support/blabla']._load.should.eql('app');
            });
        })
        .nodeify(done);      
    },
    'plugin overrides default': function(done) {
      var options = this.options;

      testUtils.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors'])
        .then(function() {
          return waigo.initAsync(options)
            .then(function checkLoadedPlugins() {
              waigo.__modules['support/errors']._load.should.eql('waigo-plugin-1_TESTPLUGIN');
            })
        })
        .nodeify(done);      
    },
    'multiple plugins for module not possible': function(done) {
      var options = this.options;

      Promise.all([
        testUtils.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors']),
        testUtils.createPluginModules('waigo-plugin-2_TESTPLUGIN', ['support/errors'])
      ])
        .then(function() {
          return new Promise(function(resolve, reject) {
            waigo.initAsync(options)
              .then(function() {
                reject(new Error('Should not be here'));
              })
              .catch(function(err) {
                err.toString().should.eql('Error: Module "support/errors" has more than one plugin implementation to choose from: waigo-plugin-1_TESTPLUGIN, waigo-plugin-2_TESTPLUGIN');
                resolve();
              });
          });
        })
        .nodeify(done);      
    },
    'app overrides plugins': function(done) {
      var options = this.options;

      Promise.all([
        testUtils.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors']),
        testUtils.createPluginModules('waigo-plugin-2_TESTPLUGIN', ['support/errors']),
        testUtils.createAppModules(['support/errors']),
      ])
        .then(function() {
          return waigo.initAsync(options)
            .then(function checkLoadedPlugins() {
              waigo.__modules['support/errors']._load.should.eql('app');
            })
        })
        .nodeify(done);      
    }
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
  },
  'once inititialised': {
    beforeEach: function(done) {
      testUtils.deleteTestFolders()
        .then(testUtils.createTestFolders)
        .then(function createTestModules() {
          return Promise.all([
            testUtils.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors']),
            testUtils.createPluginModules('waigo-plugin-2_TESTPLUGIN', ['support/onlyme', 'support/errors']),
            testUtils.createPluginModules('another-plugin_TESTPLUGIN', ['support/appoverride']),
            testUtils.createAppModules(['support/errors', 'support/appoverride']),
          ])
        })
        .then(function() {
          return waigo.initAsync({
            appFolder: testUtils.appFolder,
            plugins: {
              names: ['waigo-plugin-1_TESTPLUGIN', 'waigo-plugin-2_TESTPLUGIN', 'another-plugin_TESTPLUGIN']
            }
          });
        })
        .nodeify(done);
    },
    afterEach: function(done) {
      testUtils.deleteTestFolders().nodeify(done);
    },
    'load default': function() {
      waigo.load('support/errors').should.eql('app');
    },
    'load core version': function() {
      waigo.load('waigo:support/errors').should.eql(require(__dirname + '/../../src/support/errors'));
    },
    'load plugin version': function() {
      waigo.load('waigo-plugin-1_TESTPLUGIN:support/errors').should.eql('waigo-plugin-1_TESTPLUGIN');
    },
    'module not found': function() {
      expect(function() {
        waigo.load(':support/errors34');        
      }).to.throw('Module not found: support/errors34');
    },
    'module source missing': function() {
      expect(function() {
        waigo.load(':support/errors');        
      }).to.throw('Module source not found: ');
    },
    'module source not found': function() {
      expect(function() {
        waigo.load('random2:support/errors');        
      }).to.throw('Module source not found: random2');
    },
  }
}



