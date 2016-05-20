"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;




test['exports koa app'] = function*() {
  yield this.initApp();

  this.Application.app.should.be.instanceof(require('koa'));
};



test['load config'] = {
  beforeEach: function*() {
    this.createAppModules({
      'config/index': 'module.exports = function() { return { done: 1 }; }',
    });

    yield this.initApp();
  },

  'loads config': function*() {
    yield this.Application.loadConfig();

    this.Application.app.config.should.eql({
      done: 1
    });
  },

  'post config function': function*() {
    yield this.Application.loadConfig({
      postConfig: function(cfg) {
        cfg.again = 2;
      }
    });

    this.Application.app.config.should.eql({
      done: 1,
      again: 2,
    });
  },
};



test['setup logger'] = {
  beforeEach: function*() {
    yield this.initApp();
  },

  'sets app.logger': function*() {
    let Application = this.Application,
      app = Application.app;

    yield Application.setupLogger({});

    app.logger.error.should.be.a.function;
    app.logger.warn.should.be.a.function;
    app.logger.info.should.be.a.function;
    app.logger.debug.should.be.a.function;
    app.logger.trace.should.be.a.function;
  },

  'uncaught exception handler': function*() {
    let Application = this.Application,
      app = Application.app;

    yield Application.setupLogger({});

    let spy = this.mocker.stub(app.logger, 'error');

    let err = { stack: 'abc' };
    
    app.onUncaughtException(err);

    spy.should.have.been.calledWith('Uncaught exception', 'abc');    

    app.onUncaughtException('another');

    spy.should.have.been.calledWith('Uncaught exception', 'another');    
  },

  'on app "error" event': function*() {
    let Application = this.Application,
      app = Application.app;

    yield Application.setupLogger({});

    let spy = this.mocker.stub(app.logger, 'error');

    let err = { stack: 'abc' };
    
    app.emit('error', err);

    spy.should.have.been.calledWith('abc');    

    app.emit('error', 'another');

    spy.should.have.been.calledWith('another');        
  }
};


test['startup'] = {
  beforeEach: function*() {    
    this.createAppModules({
      'support/startup/step1': 'module.exports = function*(app) { app.step1 = 1; }',
      'support/startup/step2': 'module.exports = function*(app) { app.step2 = 2; }',
    });

    let postConfig = this.postConfig = {
      startupSteps: ["step1", "step2"],
      logging: {
        category: "test",
        minLevel: 'DEBUG',
        appenders: [],
      },      
    };

    this.startOptions = {
      postConfig: function(cfg) {
        _.extend(cfg, postConfig);
      }
    };
  },

  'ok': {
    beforeEach: function*() {
      yield this.initApp();

      this.mocker.spy(this.Application, 'loadConfig');
      this.mocker.stub(this.Application, 'setupLogger').returns(Q.resolve());
    },

    'loads config': function*() {
      yield this.Application.start(this.startOptions);

      this.Application.loadConfig.should.have.been.calledOnce;
      this.Application.loadConfig.should.have.been.calledWithExactly(this.startOptions);
    },

    'sets up logger': function*() {
      yield this.Application.start(this.startOptions);

      this.Application.setupLogger.should.have.been.calledOnce;
      this.Application.setupLogger.should.have.been.calledWithExactly({
        category:"test",
        minLevel:"DEBUG",
        appenders:[]
      });    
    },

    'runs startup steps': function*() {
      yield this.Application.start(this.startOptions);

      this.Application.app.step1.should.eql(1);
      this.Application.app.step2.should.eql(2);
    },
  },

  'fail': {
    beforeEach: function*() {
      this.createAppModules({
        'support/startup/step3': 'module.exports = function*(app) { throw new Error("fail98"); }',
      });

      this.postConfig.startupSteps = ["step1", "step3"];

      yield this.initApp();
    },

    'throws error': function*() {
      try {
        yield this.Application.start(this.startOptions);
        
        throw -1;
      } catch (err) {
        err.message.should.eql('fail98');
      }
    },
  },
};



test['shutdown'] = {
  beforeEach: function*() {    
    this.createAppModules({
      'support/shutdown/step1': 'module.exports = function*(app) { app.step1 = "shutdown1"; }',
      'support/shutdown/step2': 'module.exports = function*(app) { app.step2 = "shutdown2"; }',
    });

    let postConfig = this.postConfig = {
      startupSteps: [],
      shutdownSteps: ["step1", "step2"],
      logging: {
        category: "test",
        minLevel: 'DEBUG',
        appenders: [],
      },      
    };

    this.startOptions = {
      postConfig: function(cfg) {
        _.extend(cfg, postConfig);
      }
    };

  },

  'application must be started': function*() {
    yield this.initApp();

    delete this.Application.app.config;

    try {
      yield this.Application.shutdown();
      throw -1;
    } catch (err) {
      err.message.should.eql('Application not started');
    }
  },

  'ok': {
    beforeEach: function*() {
      yield this.initApp();

      yield this.Application.start(this.startOptions);
    },

    'runs steps': function*() {
      let app = this.Application.app;

      yield this.Application.shutdown();

      app.step1.should.eql('shutdown1');
      app.step2.should.eql('shutdown2');
    },

    'resets koa app': function*() {
      let app = this.Application.app;

      yield this.Application.shutdown();

      this.Application.app.should.not.eql(app);
    },
  },

  'fail': {
    beforeEach: function*() {
      this.createAppModules({
        'support/shutdown/step3': 'module.exports = function*(app) { throw new Error("fail98"); }',
      });

      this.postConfig.shutdownSteps = ["step1", "step3"];

      yield this.initApp();

      yield this.Application.start(this.startOptions);
    },

    'throws error': function*() {
      try {
        yield this.Application.shutdown();
        throw -1;
      } catch (err) {
        err.message.should.eql('fail98');
      }
    },
  },
};




