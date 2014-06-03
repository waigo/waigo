var _ = require('lodash'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


// waigo = waigo.load('loader') but we do this just to make sure the loader can load itself
var loader = require('../../src/loader');
loader.initPromise = Promise.coroutine(loader.init);


test['app folder'] = {
  'get': function() {
    expectedAppFolder = path.join(path.dirname(require.main.filename), 'src');
    loader.getAppFolder().should.eql(expectedAppFolder);
  }
};



test['waigo folder'] = {
  'get': function() {
    expectedFolder = path.join(__dirname + '/../../', 'src');
    loader.getWaigoFolder().should.eql(expectedFolder);
  }
};



test['init()'] = {
  beforeEach: function(done) {
    loader.__modules = null;

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

    Promise.all([
      testUtils.deletePackageJson(),
      testUtils.deleteTestFolders()
    ])
      .then(testUtils.createTestFolders)
      .then(function createPlugins() {
        return Promise.all([
          testUtils.createPluginModules('waigo-plugin-1_TESTPLUGIN'),
          testUtils.createPluginModules('waigo-plugin-2_TESTPLUGIN'),
          testUtils.createPluginModules('another-plugin_TESTPLUGIN'),
          testUtils.createAppModules({
            'pluginConfig': 'module.exports = { dependencies: {"waigo-plugin-1_TESTPLUGIN": "0.0.1"} }'
          })
        ]);
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    Promise.all([
      testUtils.deletePackageJson(),
      testUtils.deleteTestFolders(),
    ]).nodeify(done);
  },
  'can be called more than once': function(done) {
    loader.initPromise()
      .then(loader.initPromise)
      .nodeify(done);
  },
  'set app folder': function(done) {
    loader.getAppFolder().should.not.eql(testUtils.appFolder);

    loader.initPromise({
      appFolder: testUtils.appFolder
    })
      .then(function() {
        loader.getAppFolder().should.eql(testUtils.appFolder);
      })
      .nodeify(done);
  },
  'get plugin names': {
    'default options': function(done) {
      var options = {};

      loader.initPromise(options)
        .then(function checkLoadedPlugins() {
          options.plugins.names.should.eql([]);
        })
        .nodeify(done);
    },
    'custom config': {
      'object': function(done) {
        var options = this.options;

        loader.initPromise(options)
          .then(function checkLoadedPlugins() {
            options.plugins.names.should.eql(['waigo-plugin-1_TESTPLUGIN', 'waigo-plugin-2_TESTPLUGIN']);
          })
          .nodeify(done);
      },
      'path to file': {
        'custom': {
          'exists': function(done) {
            var options = this.options;
            options.plugins.config = path.join(options.appFolder, 'pluginConfig.js');

            loader.initPromise(options)
              .then(function checkLoadedPlugins() {
                options.plugins.names.should.eql(['waigo-plugin-1_TESTPLUGIN']);
              })
              .nodeify(done);          
          },
          'does not exist': function(done) {
            var options = this.options;
            options.plugins.config = path.join(options.appFolder, 'invalid.js');

            loader.initPromise(options)
              .should.be.rejectedWith("Cannot find module '" + options.plugins.config + "'")
              .and.notify(done);
          }          
        },
        'package.json': {
          'exists': function(done) {
            var options = this.options;
            options.plugins.config = 'package.json';

            testUtils.writePackageJson(
              '{ "dependencies": {"waigo-plugin-1_TESTPLUGIN": "0.0.1"} }'
            )
              .then(function() {
                return loader.initPromise(options);
              })
              .then(function checkLoadedPlugins() {
                options.plugins.names.should.eql(['waigo-plugin-1_TESTPLUGIN']);
              })
              .nodeify(done);          
          },
          'does not exist': function(done) {
            var options = this.options;
            options.plugins.config = 'package.json';

            loader.initPromise(options)
              .then(function checkLoadedPlugins() {
                options.plugins.names.should.not.contain('waigo-plugin-1_TESTPLUGIN');
              })
              .nodeify(done);          
          }          
        }
      }
    },
    'custom globbing pattern': function(done) {
      var options = this.options;
      options.plugins.glob = ['*another*'];

      loader.initPromise(options)
        .then(function checkLoadedPlugins() {
          options.plugins.names.should.eql(['another-plugin_TESTPLUGIN']);
        })
        .nodeify(done);
    },
    'custom scope': function(done) {
      var options = this.options;
      options.plugins.configKey = ['peerDependencies'];

      loader.initPromise(options)
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

      loader.initPromise(options)
        .then(function checkLoadedPlugins() {
          options.plugins.names.should.eql(['another-plugin_TESTPLUGIN']);
        })
        .nodeify(done);      
    }
  },
  'module path resolution': {
    'default version': function(done) {
      var options = this.options;

      loader.initPromise(options)
        .then(function checkLoadedPlugins() {
          loader.__modules['support/errors']._load.should.eql('waigo');
        })
        .nodeify(done);      
    },
    'app overrides default': function(done) {
      var options = this.options;

      testUtils.createAppModules(['support/errors'])
        .then(function() {
          return loader.initPromise(options)
            .then(function checkLoadedPlugins() {
              loader.__modules['support/errors']._load.should.eql('app');
            });
        })
        .nodeify(done);      
    },
    'app version only': function(done) {
      var options = this.options;

      testUtils.createAppModules(['support/blabla'])
        .then(function() {
          return loader.initPromise(options)
            .then(function checkLoadedPlugins() {
              loader.__modules['support/blabla']._load.should.eql('app');
            });
        })
        .nodeify(done);      
    },
    'plugin overrides default': function(done) {
      var options = this.options;

      testUtils.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors'])
        .then(function() {
          return loader.initPromise(options)
            .then(function checkLoadedPlugins() {
              loader.__modules['support/errors']._load.should.eql('waigo-plugin-1_TESTPLUGIN');
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
          return loader.initPromise(options);
        })
        .should.be.rejectedWith('Module "support/errors" has more than one plugin implementation to choose from: waigo-plugin-1_TESTPLUGIN, waigo-plugin-2_TESTPLUGIN')
        .and.notify(done);
    },
    'app overrides plugins': function(done) {
      var options = this.options;

      Promise.all([
        testUtils.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors']),
        testUtils.createPluginModules('waigo-plugin-2_TESTPLUGIN', ['support/errors']),
        testUtils.createAppModules(['support/errors']),
      ])
        .then(function() {
          return loader.initPromise(options)
            .then(function checkLoadedPlugins() {
              loader.__modules['support/errors']._load.should.eql('app');
            })
        })
        .nodeify(done);      
    }
  }
};




test['load()'] = {
  beforeEach: function() {
    loader.__modules = null;
  },
  'fails if not inititialised': function(done){
    try {
      loader.load();
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
          return loader.initPromise({
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
    'app overrides core': function() {
      loader.load('support/errors').should.eql('app');
    },
    'load core version': function() {
      loader.load('waigo:support/errors').should.eql(require(__dirname + '/../../src/support/errors'));
    },
    'not in app - core fallback': function() {
      loader.load('routes').should.eql(require(__dirname + '/../../src/routes'));
    },
    'load plugin version': function() {
      loader.load('waigo-plugin-1_TESTPLUGIN:support/errors').should.eql('waigo-plugin-1_TESTPLUGIN');
    },
    'app overrides plugin': function() {
      loader.load('support/appoverride').should.eql('app');
    },
    'not in app - plugin fallback': function() {
      loader.load('support/onlyme').should.eql('waigo-plugin-2_TESTPLUGIN');
    },
    'module not found': function() {
      expect(function() {
        loader.load(':support/errors34');        
      }).to.throw('Module not found: support/errors34');
    },
    'module source missing': function() {
      loader.load('support/errors').should.eql('app');
    },
    'module source not found': function() {
      expect(function() {
        loader.load('random2:support/errors');        
      }).to.throw('Module source not found: random2');
    },
  }
}



