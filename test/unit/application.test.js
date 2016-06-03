"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;




test['exports koa app'] = function*() {
  yield this.initApp();

  this.App.koa.should.be.instanceof(require('koa'));
};



test['load config'] = {
  beforeEach: function*() {
    this.createAppModules({
      'config/index': 'module.exports = function() { return { done: 1 }; }',
    });

    yield this.initApp();
  },

  'loads config': function*() {
    yield this.App._loadConfig();

    this.App.config.should.eql({
      done: 1
    });
  },

  'post config function': function*() {
    yield this.App._loadConfig({
      postConfig: function(cfg) {
        cfg.again = 2;
      }
    });

    this.App.config.should.eql({
      done: 1,
      again: 2,
    });
  },
};



test['setup logger'] = {
  beforeEach: function*() {
    yield this.initApp();
  },

  'sets App.logger': function*() {
    let App = this.App;

    yield App._setupLogger({});

    App.logger.error.should.be.a.function;
    App.logger.warn.should.be.a.function;
    App.logger.info.should.be.a.function;
    App.logger.debug.should.be.a.function;
    App.logger.trace.should.be.a.function;
  },

  'error handler': function*() {
    let App = this.App;

    yield App._setupLogger({});

    let spy = this.mocker.stub(App.logger, 'error');

    let err = { stack: 'abc' };
    
    App._onError(err);

    spy.should.have.been.calledWith('abc');    

    App._onError('another');

    spy.should.have.been.calledWith('another');    
  },

  'on App "error" event': function*() {
    let App = this.App;

    yield App._setupLogger({});

    let spy = this.mocker.stub(App.logger, 'error');

    let err = { stack: 'abc' };
    
    App.emit('error', err);

    spy.should.have.been.calledWith('abc');    

    App.emit('error', 'another');

    spy.should.have.been.calledWith('another');        
  },

  'on Koa "error" event': function*() {
    let App = this.App;

    yield App._setupLogger({});

    let spy = this.mocker.stub(App.logger, 'error');

    let err = { stack: 'abc' };
    
    App.koa.emit('error', err);

    spy.should.have.been.calledWith('abc');    

    App.koa.emit('error', 'another');

    spy.should.have.been.calledWith('another');        
  }
};


test['startup'] = {
  beforeEach: function*() {    
    this.createAppModules({
      'support/startup/step1': 'module.exports = function*(App) { App.step1 = 1; }',
      'support/startup/step2': 'module.exports = function*(App) { App.step2 = 2; }',
    });

    let postConfig = this.postConfig = {
      startupSteps: ["step1", "step2"],
      shutdownSteps: [],
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

      this.mocker.spy(this.App, '_loadConfig');
      this.mocker.spy(this.App, '_setupLogger');
    },

    'loads config': function*() {
      yield this.App.start(this.startOptions);

      this.App._loadConfig.should.have.been.calledOnce;
      this.App._loadConfig.should.have.been.calledWithExactly(this.startOptions);
    },

    'sets up logger': function*() {
      yield this.App.start(this.startOptions);

      this.App._setupLogger.should.have.been.calledOnce;
      this.App._setupLogger.should.have.been.calledWithExactly({
        category:"test",
        minLevel:"DEBUG",
        appenders:[]
      });    
    },

    'runs startup steps': function*() {
      yield this.App.start(this.startOptions);

      this.App.step1.should.eql(1);
      this.App.step2.should.eql(2);
    },

    'application must not be started': function*() {
      yield this.App.start(this.startOptions);

      try {
        yield this.App.start(this.startOptions);
        throw -1;
      } catch (err) {
        err.message.should.eql('Application already started');
      }
    },
  },

  'fail': {
    beforeEach: function*() {
      this.createAppModules({
        'support/startup/step3': 'module.exports = function*(App) { throw new Error("fail98"); }',
      });

      this.postConfig.startupSteps = ["step1", "step3"];

      yield this.initApp();
    },

    afterEach: function*() {
      yield this.App.shutdown();
    },

    'throws error': function*() {
      try {
        yield this.App.start(this.startOptions);
        
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
      'support/shutdown/step1': 'module.exports = function*(App) { App.step1 = "shutdown1"; }',
      'support/shutdown/step2': 'module.exports = function*(App) { App.step2 = "shutdown2"; }',
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

    delete this.App.config;

    try {
      yield this.shutdownApp();
      throw -1;
    } catch (err) {
      err.message.should.eql('Application not started');
    }
  },

  'ok': {
    beforeEach: function*() {
      yield this.initApp();

      yield this.App.start(this.startOptions);
    },

    'runs steps': function*() {
      let App = this.App;

      yield this.shutdownApp();

      App.step1.should.eql('shutdown1');
      App.step2.should.eql('shutdown2');
    },

    'resets koa app': function*() {
      let koa = this.App.koa;

      yield this.shutdownApp();

      this.App.koa.should.not.eql(koa);
    },
  },

  'fail': {
    beforeEach: function*() {
      this.createAppModules({
        'support/shutdown/step3': 'module.exports = function*(App) { throw new Error("fail98"); }',
      });

      this.postConfig.shutdownSteps = ["step1", "step3"];

      yield this.initApp();

      yield this.App.start(this.startOptions);
    },

    'throws error': function*() {
      try {
        yield this.shutdownApp();
        throw -1;
      } catch (err) {
        err.message.should.eql('fail98');
      }
    },
  },
};




