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


  'setup logging': {
    beforeEach: function(done) {
      var self = this;

      testUtils.createAppModules({
        'support/logging/test': 'module.exports = { create: function() { return Array.prototype.slice.call(arguments); } }; '
      })
        .then(function() {
          return self.resetWaigo();
        })
        .then(function() {
          self.app = waigo.load('server');

          self.app.config = {
            logging: {
              test: {
                hello: 'world'
              }
            }
          };
        })
        .nodeify(done);
    },
    'uses config to create logger': function(done) {
      var self = this;

      Promise.spawn(self.app.setupLogger)
        .then(function() {
          self.app.logger.should.eql([ 
            self.app.config,
            {'hello': 'world'}
          ]);
        })
        .nodeify(done);
    },
    'catches uncaught exceptions': function(done) {
      var self = this;

      var processOnSpy = test.mocker.spy(process, 'on');

      Promise.spawn(self.app.setupLogger)
        .then(function() {
          expect(processOnSpy.callCount).to.eql(1);
          expect(processOnSpy.getCall(0).args[0]).to.eql('uncaughtException');

          handlerFunc = processOnSpy.getCall(0).args[1];
          
          self.app.logger.error = test.mocker.spy();
          var err = new Error('test');
          handlerFunc.call(process, err);

          self.app.logger.error.should.have.been.calledOnce;
          self.app.logger.error.should.have.been.calledWithExactly('Uncaught exception', err.stack);
        })
        .nodeify(done);
    },
    'catches app error events': function(done) {
      var self = this;

      var appOnSpy = test.mocker.spy(self.app, 'on');

      Promise.spawn(self.app.setupLogger)
        .then(function() {
          expect(appOnSpy.callCount).to.eql(1);
          expect(appOnSpy.getCall(0).args[0]).to.eql('error');

          handlerFunc = appOnSpy.getCall(0).args[1];
          
          self.app.logger.error = test.mocker.spy();
          var err = new Error('test');
          handlerFunc.call(self.app, err);

          self.app.logger.error.should.have.been.calledOnce;
          self.app.logger.error.should.have.been.calledWithExactly(err);
        })
        .nodeify(done);      
    }
  },


  'setup database': {
    beforeEach: function(done) {
      var self = this;

      testUtils.createAppModules({
        'support/db/test': 'module.exports = { create: function() { return Array.prototype.slice.call(arguments); } }; '
      })
        .then(function() {
          return self.resetWaigo();
        })
        .then(function() {
          self.app = waigo.load('server');

          self.app.config = {
            db: {
              test: {
                hello: 'world'
              }
            }
          };
        })
        .nodeify(done);      
    },
    'does nothing if no config': function(done) {
      var self = this;

      delete self.app.config.db;

      Promise.spawn(self.app.setupDatabase)
        .then(function() {
          expect(self.app.db).to.be.undefined;
        })
        .nodeify(done);
    },
    'otherwise sets up the db': function(done) {
      var self = this;

      Promise.spawn(self.app.setupDatabase)
        .then(function() {
          self.app.db.should.eql([
            { hello: 'world' }
          ]);
        })
        .nodeify(done);
    }    
  },


  'request middleware': {
    'X-Response-Time': {
      beforeEach: function(done) {
        var self = this;

        testUtils.createAppModules({
            'support/middleware/responseTime': 'module.exports = function() { return function*() { yield 123; }; }; '
          })
            .then(function() {
              return self.resetWaigo();
            })
            .then(function() {
              self.app = waigo.load('server');
            })
            .nodeify(done);      
      },
      'default': function(done) {
        var app = this.app,
          appUseSpy = test.mocker.spy(app, 'use');

        Promise.spawn(app.setupResponseTime)
          .then(function() {
            appUseSpy.should.have.been.calledOnce;
            
            var fn = appUseSpy.getCall(0).args[0];

            var gen = fn();
            var value = gen.next().value;
            expect(value).to.eql(123);
          })
          .nodeify(done);
      }
    },
    'error handler': {
      beforeEach: function(done) {
        var self = this;

        testUtils.createAppModules({
          'support/middleware/errorHandler': 'module.exports = function() { return Array.prototype.slice.call(arguments); }; '
        })
          .then(function() {
            return self.resetWaigo();
          })
          .then(function() {
            self.app = waigo.load('server');
          })
          .nodeify(done);      
      },
      'default': function(done) {
        var app = this.app,
          appUseSpy = test.mocker.stub(app, 'use');

        app.config.errorHandler = { hello: 'world' };

        Promise.spawn(app.setupErrorHandler)
          .then(function() {
            appUseSpy.should.have.been.calledOnce;

            appUseSpy.getCall(0).args[0].should.eql([
              { hello: 'world'}
            ]);
          })
          .nodeify(done);
      }
    },
    'static resources': {
      beforeEach: function(done) {
        var self = this;

        testUtils.createAppModules({
            'support/middleware/staticResources': 'module.exports = function(staticFolder) { return function*() { yield staticFolder; }; }; '
          })
            .then(function() {
              return self.resetWaigo();
            })
            .then(function() {
              self.app = waigo.load('server');
            })
            .nodeify(done);      
      },
      'default': function(done) {
        var app = this.app,
          appUseSpy = test.mocker.spy(app, 'use');

        app.config = {
          staticFolder: 'blahblah'
        };

        Promise.spawn(app.setupStaticResources)
          .then(function() {
            appUseSpy.should.have.been.calledOnce;
            
            var fn = appUseSpy.getCall(0).args[0];

            var gen = fn();
            var value = gen.next().value;
            expect(value).to.eql('blahblah');
          })
          .nodeify(done);
      }
    },    
    'sessions': {
      beforeEach: function(done) {
        var self = this;

      testUtils.createAppModules({
        'support/middleware/sessions': 'module.exports = function() { var args = Array.prototype.slice.call(arguments); return function*() { yield args; }; };',
        'support/session/store/testStore': 'module.exports = { create: function(app, cfg) { return cfg; } };'
      })
        .then(function() {
          return self.resetWaigo();
        })
        .then(function() {
          self.app = waigo.load('server');
        })
        .nodeify(done);      
      },
      'does nothing if no sessions config found': function(done) {
        var app = this.app,
          appUseSpy = test.mocker.stub(app, 'use');

        delete app.config.session;

        Promise.spawn(app.setupSessions)
          .then(function() {
            appUseSpy.should.have.been.notCalled;
          })
          .nodeify(done);
      },
      'verifies that cookie signing keys are set': function(done) {
        var app = this.app;

        app.config.session = {};

        new Promise(function(resolve, reject) {
          Promise.spawn(app.setupSessions)
            .catch(function(err) {
              err.toString().should.eql('Error: Please specify cookie signing keys (session.keys) in the config file.');
              expect(app.keys).to.be.undefined;
              resolve();
            })
            .then(function() {
              reject(new Error('Should not be here'));
            })
        })
          .nodeify(done);
      },
      'default': function(done) {
        var app = this.app,
          appUseSpy = test.mocker.stub(app, 'use');

        var createStoreSpy = test.mocker.spy(waigo.load('support/session/store/testStore'),'create');

        app.config.session = { 
          keys: ['testKey'],
          name: 'sessionName',
          store: {
            type: 'testStore',
            config: {
              hello: 'world'
            }
          },
          cookie: {
            validForDays: 3,
            path: '/blah'
          }
        };

        Promise.spawn(app.setupSessions)
          .then(function() {
            app.keys.should.not.be.undefined;

            createStoreSpy.should.have.been.calledOnce;
            createStoreSpy.should.have.been.calledWithExactly(app, {hello: 'world'});

            appUseSpy.should.have.been.calledOnce;

            var fn = appUseSpy.getCall(0).args[0];
            var gen = fn();
            var value = gen.next().value[0];

            // expires value is accurate to the millisecond so let's munge it
            expect(value.cookie.expires).to.be.instanceof(Date);
            expect(moment(value.cookie.expires).format('YYYY-MM-DD')).to.eql(moment().add('days', 3).format('YYYY-MM-DD'));
            delete value.cookie.expires;

            expect(value).to.eql({
              name: 'sessionName',
              store: {hello: 'world'},
              cookie: {
                path: '/blah'
              }              
            });
          })
          .nodeify(done);
      }
    },
    'output formats': {
      beforeEach: function(done) {
        var self = this;

      testUtils.createAppModules({
        'support/middleware/outputFormats': 'module.exports = function() { return Array.prototype.slice.call(arguments); }; '
      })
        .then(function() {
          return self.resetWaigo();
        })
        .then(function() {
          self.app = waigo.load('server');
        })
        .nodeify(done);      
      },
      'default': function(done) {
        var app = this.app,
          appUseSpy = test.mocker.stub(app, 'use');

        app.config.outputFormats = { hello: 'world' };

        Promise.spawn(app.setupOutputFormats)
          .then(function() {
            appUseSpy.should.have.been.calledOnce;

            appUseSpy.getCall(0).args[0].should.eql([
              { hello: 'world'}
            ]);
          })
          .nodeify(done);
      }
    }
  },


  'setup routes': {
    beforeEach: function(done) {
      var self = this;

      testUtils.createAppModules({
        'routes': 'module.exports = { "GET /": "test.index" };',
        'support/routeMapper': 'module.exports = { map: function() {} };'
      })
        .then(function() {
          return self.resetWaigo();
        })
        .then(function() {
          self.app = waigo.load('server');
        })
        .nodeify(done);      
    },    
    'loads routes': function(done) {
      var app = this.app;

      Promise.spawn(app.setupRoutes)
        .then(function() {
          app.routes.should.eql({
            'GET /': 'test.index'
          });
        })
        .nodeify(done);
    },
    'maps routes': function(done) {
      var app = this.app;

      var routeMapper = waigo.load('support/routeMapper'),
        mapSpy = test.mocker.spy(routeMapper, 'map');

      Promise.spawn(app.setupRoutes)
        .then(function() {
          mapSpy.should.have.been.calledOnce;
          mapSpy.should.have.been.calledWithExactly(app, app.routes);
        })
        .nodeify(done);
    },
    'enables Koa router': function(done) {
      var app = this.app;

      var appUseSpy = test.mocker.spy(app, 'use');

      Promise.spawn(app.setupRoutes)
        .then(function() {
          appUseSpy.should.have.been.calledOnce;
          appUseSpy.should.have.been.calledWithExactly(app.router);
        })
        .nodeify(done);
    }
  },


  'start server': {
    beforeEach: function(done) {
      var self = this;

      self.resetWaigo()
        .then(function() {
          self.app = waigo.load('server');

          self.app.config = {
            port: 3000,
            baseURL: 'http://dummy:4334'
          };
        })
        .nodeify(done);      
    },    
    'use config port': function(done) {
      var app = this.app;

      app.listen = test.mocker.stub();
      app.logger = {
        info: test.mocker.stub()
      };

      Promise.spawn(app.startServer)
        .then(function() {
          app.listen.should.have.been.calledOnce;
          app.listen.should.have.been.calledWithExactly(3000);

          app.logger.info.should.have.been.calledOnce;
          app.logger.info.should.have.been.calledWithExactly('Server listening on port 3000 (baseURL: http://dummy:4334)');
        })
        .nodeify(done);
    }
  },


  'start app': {
    beforeEach: function(done) {
      var self = this;

      self.resetWaigo()
        .then(function() {
          self.app = waigo.load('server');
        })
        .nodeify(done);            
    },
    'calls initialisation methods in order': function(done) {
      var app = this.app;

      var executed = [];

      var methods = [
        'loadConfig', 
        'setupLogger', 
        'setupDatabase', 
        'setupResponseTime',
        'setupErrorHandler',
        'setupSessions',
        'setupStaticResources',
        'setupOutputFormats',
        'setupRoutes',
        'startServer'
      ];

      methods.forEach(function(method) {
        app[method] = (function(methodName) {
          return function*() {
            executed.push(methodName);
          }
        })(method);
      });

      Promise.spawn(app.start)
        .then(function() {
          executed.should.eql(methods);
        })
        .nodeify(done);
    } 
  }
}
