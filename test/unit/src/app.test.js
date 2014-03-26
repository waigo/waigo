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
        var app = waigo.load('app');
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
        var app = waigo.load('app');
        
        return Promise.spawn(app.loadConfig)
          .then(function() {
            app.config.should.eql('hello world');
          });
      })
      .nodeify(done);    
  },



  // 'request middleware': {
  //   'X-Response-Time': {
  //     beforeEach: function(done) {
  //       var self = this;

  //       testUtils.createAppModules({
  //           'support/middleware/responseTime': 'module.exports = function() { return function*() { yield 123; }; }; '
  //         })
  //           .then(function() {
  //             return self.resetWaigo();
  //           })
  //           .then(function() {
  //             self.app = waigo.load('app');
  //           })
  //           .nodeify(done);      
  //     },
  //     'default': function(done) {
  //       var app = this.app,
  //         appUseSpy = test.mocker.spy(app, 'use');

  //       Promise.spawn(app.setupResponseTime)
  //         .then(function() {
  //           appUseSpy.should.have.been.calledOnce;
            
  //           var fn = appUseSpy.getCall(0).args[0];

  //           var gen = fn();
  //           var value = gen.next().value;
  //           expect(value).to.eql(123);
  //         })
  //         .nodeify(done);
  //     }
  //   },
  //   'error handler': {
  //     beforeEach: function(done) {
  //       var self = this;

  //       testUtils.createAppModules({
  //         'support/middleware/errorHandler': 'module.exports = function() { return Array.prototype.slice.call(arguments); }; '
  //       })
  //         .then(function() {
  //           return self.resetWaigo();
  //         })
  //         .then(function() {
  //           self.app = waigo.load('app');
  //         })
  //         .nodeify(done);      
  //     },
  //     'default': function(done) {
  //       var app = this.app,
  //         appUseSpy = test.mocker.stub(app, 'use');

  //       app.config.errorHandler = { hello: 'world' };

  //       Promise.spawn(app.setupErrorHandler)
  //         .then(function() {
  //           appUseSpy.should.have.been.calledOnce;

  //           appUseSpy.getCall(0).args[0].should.eql([
  //             { hello: 'world'}
  //           ]);
  //         })
  //         .nodeify(done);
  //     }
  //   },
  //   'static resources': {
  //     beforeEach: function(done) {
  //       var self = this;

  //       testUtils.createAppModules({
  //           'support/middleware/staticResources': 'module.exports = function(options) { return function*() { yield options; }; }; '
  //         })
  //           .then(function() {
  //             return self.resetWaigo();
  //           })
  //           .then(function() {
  //             self.app = waigo.load('app');
  //           })
  //           .nodeify(done);      
  //     },
  //     'default': function(done) {
  //       var app = this.app,
  //         appUseSpy = test.mocker.spy(app, 'use');

  //       app.config = {
  //         staticResources: {
  //           folder: 'blahblah',
  //           options: {
  //             hello: 'world'
  //           }
  //         }
  //       };

  //       Promise.spawn(app.setupStaticResources)
  //         .then(function() {
  //           appUseSpy.should.have.been.calledOnce;
            
  //           var fn = appUseSpy.getCall(0).args[0];

  //           var gen = fn();
  //           var value = gen.next().value;
  //           expect(value).to.eql({
  //             folder: 'blahblah',
  //             options: {
  //               hello: 'world'
  //             }              
  //           });
  //         })
  //         .nodeify(done);
  //     }
  //   },    
  //   'output formats': {
  //     beforeEach: function(done) {
  //       var self = this;

  //     testUtils.createAppModules({
  //       'support/middleware/outputFormats': 'module.exports = function() { return Array.prototype.slice.call(arguments); }; '
  //     })
  //       .then(function() {
  //         return self.resetWaigo();
  //       })
  //       .then(function() {
  //         self.app = waigo.load('app');
  //       })
  //       .nodeify(done);      
  //     },
  //     'default': function(done) {
  //       var app = this.app,
  //         appUseSpy = test.mocker.stub(app, 'use');

  //       app.config.outputFormats = { hello: 'world' };

  //       Promise.spawn(app.setupOutputFormats)
  //         .then(function() {
  //           appUseSpy.should.have.been.calledOnce;

  //           appUseSpy.getCall(0).args[0].should.eql([
  //             { hello: 'world'}
  //           ]);
  //         })
  //         .nodeify(done);
  //     }
  //   }
  // },


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
        self.app = waigo.load('app');
      })
      .nodeify(done);    
    },
    'loads app configuration': function(done) {
      var self = this;

      test.mocker.stub(self.app, 'loadConfig', function*() {});

      testUtils.spawn(self.app.start)
        .then(function() {
          self.app.loadConfig.should.have.been.calledOnce;
        })
        .nodeify(done);
    },
    'executes startup steps': function(done) {
      var self = this;

      test.mocker.stub(self.app, 'loadConfig', function*() {
        self.app.config = {
          startupSteps: [
            'test1',
            'test2'
          ]
        }
      });

      testUtils.spawn(self.app.start)
        .then(function(val) {
          val.should.eql(2);
          self.app.dummy1.should.eql(128);
          self.app.dummy2.should.eql(256);
        })
        .nodeify(done);
    }
  }
}
