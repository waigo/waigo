"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;

// waigo = waigo.load('loader') but we do this just to make sure the loader can load itself
var loader = require('../../src/loader');



test['app folder'] = {
  'get': function() {
    this.expect(loader.getAppFolder()).to.be.null;
  }
};



test['waigo folder'] = {
  'get': function() {
    let expectedFolder = path.join(__dirname, '..', '..', 'src');

    loader.getWaigoFolder().should.eql(expectedFolder);
  }
};



test['init()'] = {
  beforeEach: function*() {
    loader.reset();

    this.options = {
      appFolder: this.appFolder,
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

    this.deletePackageJson();
    this.deleteTestFolders();
    this.createTestFolders();
    this.createPluginModules('waigo-plugin-1_TESTPLUGIN');
    this.createPluginModules('waigo-plugin-2_TESTPLUGIN');
    this.createPluginModules('another-plugin_TESTPLUGIN');
    this.createAppModules({
      'pluginConfig': 'module.exports = { dependencies: {"waigo-plugin-1_TESTPLUGIN": "0.0.1"} }'
    });
  },
  afterEach: function*() {
    this.deletePackageJson();
    this.deleteTestFolders();
  },
  'can be called more than once': function*() {
    yield loader.init({
      appFolder: this.appFolder
    });

    yield loader.init({
      appFolder: this.appFolder
    });
  },
  'set app folder': function*() {
    yield loader.init({
      appFolder: this.appFolder
    });

    loader.getAppFolder().should.eql(this.appFolder);
  },
  'get plugin names': {
    'default options': function*() {
      var options = {
        appFolder: this.appFolder
      };

      options = yield loader.init(options);

      options.plugins.names.should.eql([]);
    },
    'custom config': {
      'object': function*() {
        var options = this.options;

        options = yield loader.init(options);

        options.plugins.names.should.eql(['waigo-plugin-1_TESTPLUGIN', 'waigo-plugin-2_TESTPLUGIN']);
      },
      'path to file': {
        'custom': {
          'exists': function*() {
            var options = this.options;

            options.plugins.config = path.join(options.appFolder, 'pluginConfig.js');

            options = yield loader.init(options);

            options.plugins.names.should.eql(['waigo-plugin-1_TESTPLUGIN']);
          },
          'does not exist': function*() {
            var options = this.options;

            options.plugins.config = path.join(options.appFolder, 'invalid.js');

            co(loader.init(options))
              .should.be.rejectedWith(`Unable to load config file: ${options.plugins.config}`);
          }          
        },
        'package.json': {
          'exists': function*() {
            var options = this.options;

            options.plugins.config = 'package.json';

            this.writePackageJson(
              '{ "dependencies": {"waigo-plugin-1_TESTPLUGIN": "0.0.1"} }'
            );

            options = yield loader.init(options);

            options.plugins.names.should.eql(['waigo-plugin-1_TESTPLUGIN']);
          },
          'does not exist': function*() {
            var options = this.options;

            options.plugins.config = 'package.json';

            options = yield loader.init(options);

            options.plugins.names.should.not.contain('waigo-plugin-1_TESTPLUGIN');
          }          
        }
      }
    },
    'plugin not found': {
      beforeEach: function*() {
        this.options.plugins.config.dependencies['waigo-plugin-3_TESTPLUGIN'] = '0.0.1';
      },
      afterEach: function*() {
        delete process.env.PLUGIN_SEARCH_FOLDER;
      },
      'throws error': function*() {
        co(loader.init(this.options))
          .should.be.rejectedWith("Cannot find module 'waigo-plugin-3_TESTPLUGIN'");
      },
      'unless present in additional search path': function*() {
        let folder = path.join(this.appFolder, 'extra', 'waigo-plugin-3_TESTPLUGIN', 'src');

        this.createFolder(folder);

        this.writeFile(path.join(folder, 'package.json'), '{ "name": "waigo-plugin-3_TESTPLUGIN", "version": "0.0.1" }');
        this.writeFile(path.join(folder, 'index.js'), 'module.exports = {}');

        process.env.PLUGIN_SEARCH_FOLDER = path.join(this.appFolder, 'extra');

        yield loader.init(this.options);
      },
    },
    'custom globbing pattern': function*() {
      var options = this.options;

      options.plugins.glob = ['*another*'];

      options = yield loader.init(options);

      options.plugins.names.should.eql(['another-plugin_TESTPLUGIN']);
    },
    'custom scope': function*() {
      var options = this.options;

      options.plugins.configKey = ['peerDependencies'];

      options = yield loader.init(options);

      options.plugins.names.should.eql([]);
    },
    'directly specified': function*() {
      var options = {
        appFolder: this.appFolder,
        plugins: {
          names: ['another-plugin_TESTPLUGIN']
        }
      };

      options = yield loader.init(options);

      options.plugins.names.should.eql(['another-plugin_TESTPLUGIN']);
    }
  },
  'module path resolution': {
    'default version': function*() {
      var options = this.options;

      yield loader.init(options);

      loader.getPath('support/errors').should.eql(
        path.join(loader.getWaigoFolder(), 'support', 'errors.js')
      );
    },
    'app overrides default': function*() {
      var options = this.options;

      this.createAppModules(['support/errors']);

      yield loader.init(options);

      loader.getPath('support/errors').should.eql(
        path.join(loader.getAppFolder(), 'support', 'errors.js')
      );
    },
    'app version only': function*() {
      var options = this.options;

      this.createAppModules(['support/blabla']);

      yield loader.init(options);

      loader.getPath('support/blabla').should.eql(
        path.join(loader.getAppFolder(), 'support', 'blabla.js')
      );
    },
    'plugin overrides default': function*() {
      var options = this.options;

      this.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors']);

      yield loader.init(options);

      loader.getPath('support/errors').should.eql(
        path.join(this.pluginsFolder, 'waigo-plugin-1_TESTPLUGIN', 'src', 'support', 'errors.js')
      );
    },
    'multiple plugins for module not possible': function*() {
      var options = this.options;

      this.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors']);
      this.createPluginModules('waigo-plugin-2_TESTPLUGIN', ['support/errors']);

      co(loader.init(options))
        .should.be.rejectedWith('Path "support/errors" has more than one plugin implementation to choose from: waigo-plugin-1_TESTPLUGIN, waigo-plugin-2_TESTPLUGIN');
    },
    'app overrides plugins': function*() {
      var options = this.options;

      this.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors']);
      this.createPluginModules('waigo-plugin-2_TESTPLUGIN', ['support/errors']);
      this.createAppModules(['support/errors']);

      yield loader.init(options);

      loader.getPath('support/errors').should.eql(
        path.join(loader.getAppFolder(), 'support', 'errors.js')
      );
    }
  }
};




test['load()'] = {
  beforeEach: function() {
    loader.reset();
  },
  'fails if not initialised': function*(){
    this.expect(() => {
      loader.load();
    }).to.throw('Please initialise Waigo first');
  },
  'once inititialised': {
    beforeEach: function*() {
      this.deleteTestFolders();
      this.createTestFolders();
      this.createPluginModules('waigo-plugin-1_TESTPLUGIN', ['support/errors']);
      this.createPluginModules('waigo-plugin-2_TESTPLUGIN', ['support/onlyme', 'support/errors']);
      this.createPluginModules('another-plugin_TESTPLUGIN', ['support/appoverride']);
      this.createAppModules(['support/errors', 'support/appoverride']);

      yield loader.init({
        appFolder: this.appFolder,
        plugins: {
          names: ['waigo-plugin-1_TESTPLUGIN', 'waigo-plugin-2_TESTPLUGIN', 'another-plugin_TESTPLUGIN']
        }
      });
    },
    afterEach: function*() {
      this.deleteTestFolders();
    },
    'app overrides core': function() {
      loader.load('support/errors').should.eql('app');
    },
    'load core version': function() {
      loader.load('waigo:support/lodashMixins').should.eql(require(path.resolve(__dirname + '/../../src/support/lodashMixins.js')));
    },
    'not in app - core fallback': function() {
      loader.load('routes/index').should.eql(require(path.resolve(__dirname + '/../../src/routes/index')));
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
      this.expect(function() {
        loader.load(':support/errors34');        
      }).to.throw('File not found: support/errors34');
    },
    'module source missing': function() {
      loader.load('support/errors').should.eql('app');
    },
    'module source not found': function() {
      this.expect(function() {
        loader.load('random2:support/errors');        
      }).to.throw('File source not found: random2');
    },
  },
};



