var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


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
        
        return Promise.spawn(Application.loadConfig)
          .then(function() {
            Application.app.config.should.eql('hello world');
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

      test.mocker.stub(self.Application, 'loadConfig', function*() {});

      testUtils.spawn(self.Application.start)
        .then(function() {
          self.Application.loadConfig.should.have.been.calledOnce;
        })
        .nodeify(done);
    },
    'executes startup steps': function(done) {
      var self = this;

      test.mocker.stub(self.Application, 'loadConfig', function*() {
        self.Application.app.config = {
          startupSteps: [
            'test1',
            'test2'
          ]
        }
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

      self.resetWaigo()
        .then(function() {
          self.Application = waigo.load('application');
        })
        .nodeify(done);
    },
    'closes the server if set': function(done) {
      var self = this;

      var closed = 0;
      self.Application.app.server = {
        close: function(cb) {
          closed += 1;
          cb();
        }
      };

      testUtils.spawn(self.Application.shutdown)
        .then(function() {
          closed.should.eql(1);
        })
        .nodeify(done);
    },
    'recreates app': function(done) {
      var self = this;

      self.Application.app.middleware = [1];

      testUtils.spawn(self.Application.shutdown)
        .then(function() {
          expect(self.Application.app.middleware).to.eql([]);
        })
        .nodeify(done);
    }
  }

}
