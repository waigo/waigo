var moment = require('moment'),
  path = require('path');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo,
  _ = waigo._;


const DUMMY_CONFIG = {
  logging: {
    minLevel: 'debug'
  },
  startupSteps: [],
  shutdownSteps: [],
};



test['app'] = {
  beforeEach: function(done) {
    this.resetWaigo = function() {      
      return waigo.initAsync({
        appFolder: testUtils.appFolder
      });
    }

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .nodeify(done);    
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },


  'exports koa object': function(done) {
    this.resetWaigo()
      .then(function() {
        var app = waigo.load('application').app;
        app.listen.should.be.instanceof(Function);    
      })
      .nodeify(done);
  },


  'load config': function(done) {
    var self = this;

    testUtils.createAppModules({
      'config/index': 'module.exports = function() { return "hello world"; };'
    })
      .then(function() {
        return self.resetWaigo();
      })
      .then(function() {
        var Application = waigo.load('application');
        
        return testUtils.spawn(Application.loadConfig)
          .then(function() {
            Application.app.config.should.eql('hello world');
          });
      })
      .nodeify(done);    
  },


  'dynamic config': function(done) {
    var self = this;

    testUtils.createAppModules({
      'config/index': 'module.exports = function() { return "hello world"; };'
    })
      .then(function() {
        return self.resetWaigo();
      })
      .then(function() {
        var Application = waigo.load('application');

        var options = {
          postConfig: test.mocker.spy()
        };
        
        return testUtils.spawn(Application.loadConfig, Application, options)
          .then(function() {
            options.postConfig.should.have.been.calledOnce;
            options.postConfig.should.have.been.calledWithExactly('hello world');
          });
      })
      .nodeify(done);    
  },


  'start app': {
    beforeEach: function(done) {
      var self = this;

    testUtils.createAppModules({
      'support/startup/test1': 'module.exports = function*(app) { app.dummy1 = 128; return 1; };',
      'support/startup/test2': 'module.exports = function*(app) { app.dummy2 = 256; return 2; };'
    })
      .then(function() {
        return self.resetWaigo();
      })
      .then(function() {
        self.Application = waigo.load('application');
      })
      .nodeify(done);    
    },
    'loads app configuration': function(done) {
      var self = this;

      test.mocker.stub(self.Application, 'loadConfig', function*() {
        self.Application.app.config = DUMMY_CONFIG;
      });

      var options = {
        dummy: true
      };

      testUtils.spawn(self.Application.start, self.Application, options)
        .then(function() {
          self.Application.loadConfig.should.have.been.calledOnce;
          self.Application.loadConfig.should.have.been.calledWithExactly(options);
        })
        .nodeify(done);
    },
    'executes startup steps': function(done) {
      var self = this;

      test.mocker.stub(self.Application, 'loadConfig', function*() {
        self.Application.app.config = _.extend(DUMMY_CONFIG, {
          startupSteps: [
            'test1',
            'test2'
          ]
        });
      });

      testUtils.spawn(self.Application.start)
        .then(function(val) {
          self.Application.app.dummy1.should.eql(128);
          self.Application.app.dummy2.should.eql(256);
        })
        .nodeify(done);
    }
  },


  'shutdown app': {
    beforeEach: function(done) {
      var self = this;

      testUtils.createAppModules({
        'support/shutdown/test': 'module.exports = function*(app) { app.shutdown = 123; };'
      })
        .then(function() {
          return self.resetWaigo();
        })
        .then(function() {
          self.Application = waigo.load('application');
          self.app = self.Application.app;
        })
        .nodeify(done);
    },
    'config must be loaded first': function(done) {
      testUtils.spawn(this.Application.shutdown)
        .then(() => {
          throw new Error('Unexpected');
        })
        .catch((err) => {
          err.message.should.eql('Application not started');
          err.type.should.eql('ShutdownError');
        })
        .nodeify(done);
    },
    'calls shutdown steps': function(done) {
      var self = this;

      self.Application.app.config.shutdownSteps = [
        'test'
      ];

      testUtils.spawn(self.Application.shutdown)
        .then(function() {
          self.app.shutdown.should.eql(123);
        })
        .nodeify(done);

    },
    'recreates app': function(done) {
      var self = this;

      self.Application.app.config.shutdownSteps = [];

      self.Application.app.middleware = [1];

      testUtils.spawn(self.Application.shutdown)
        .then(function() {
          expect(self.Application.app.middleware).to.eql([]);
        })
        .nodeify(done);
    }
  }

}
