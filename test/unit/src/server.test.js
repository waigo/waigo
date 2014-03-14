var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


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


  'exports': function(done) {
    this.resetWaigo()
      .then(function() {
        var app = waigo.load('server');
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
        var app = waigo.load('server');
        
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
  //             self.app = waigo.load('server');
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
  //           self.app = waigo.load('server');
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
  //             self.app = waigo.load('server');
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
  //   'sessions': {
  //     beforeEach: function(done) {
  //       var self = this;

  //     testUtils.createAppModules({
  //       'support/middleware/sessions': 'module.exports = function() { var args = Array.prototype.slice.call(arguments); return function*() { yield args; }; };',
  //       'support/session/store/testStore': 'module.exports = { create: function(app, cfg) { return cfg; } };'
  //     })
  //       .then(function() {
  //         return self.resetWaigo();
  //       })
  //       .then(function() {
  //         self.app = waigo.load('server');
  //       })
  //       .nodeify(done);      
  //     },
  //     'does nothing if no sessions config found': function(done) {
  //       var app = this.app,
  //         appUseSpy = test.mocker.stub(app, 'use');

  //       delete app.config.session;

  //       Promise.spawn(app.setupSessions)
  //         .then(function() {
  //           appUseSpy.should.have.been.notCalled;
  //         })
  //         .nodeify(done);
  //     },
  //     'verifies that cookie signing keys are set': function(done) {
  //       var app = this.app;

  //       app.config.session = {};

  //       new Promise(function(resolve, reject) {
  //         Promise.spawn(app.setupSessions)
  //           .catch(function(err) {
  //             err.toString().should.eql('Error: Please specify cookie signing keys (session.keys) in the config file.');
  //             expect(app.keys).to.be.undefined;
  //             resolve();
  //           })
  //           .then(function() {
  //             reject(new Error('Should not be here'));
  //           })
  //       })
  //         .nodeify(done);
  //     },
  //     'default': function(done) {
  //       var app = this.app,
  //         appUseSpy = test.mocker.stub(app, 'use');

  //       var createStoreSpy = test.mocker.spy(waigo.load('support/session/store/testStore'),'create');

  //       app.config.session = { 
  //         keys: ['testKey'],
  //         name: 'sessionName',
  //         store: {
  //           type: 'testStore',
  //           config: {
  //             hello: 'world'
  //           }
  //         },
  //         cookie: {
  //           validForDays: 3,
  //           path: '/blah'
  //         }
  //       };

  //       Promise.spawn(app.setupSessions)
  //         .then(function() {
  //           app.keys.should.not.be.undefined;

  //           createStoreSpy.should.have.been.calledOnce;
  //           createStoreSpy.should.have.been.calledWithExactly(app, {hello: 'world'});

  //           appUseSpy.should.have.been.calledOnce;

  //           var fn = appUseSpy.getCall(0).args[0];
  //           var gen = fn();
  //           var value = gen.next().value[0];

  //           // expires value is accurate to the millisecond so let's munge it
  //           expect(value.cookie.expires).to.be.instanceof(Date);
  //           expect(moment(value.cookie.expires).format('YYYY-MM-DD')).to.eql(moment().add('days', 3).format('YYYY-MM-DD'));
  //           delete value.cookie.expires;

  //           expect(value).to.eql({
  //             name: 'sessionName',
  //             store: {hello: 'world'},
  //             cookie: {
  //               path: '/blah'
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
  //         self.app = waigo.load('server');
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

      self.resetWaigo()
        .then(function() {
          self.app = waigo.load('server');
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
    }
  }
}
