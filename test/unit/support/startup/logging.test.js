var moment = require('moment'),
  path = require('path'),
  Q = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;



test['logging'] = {
  beforeEach: function*() {
    

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        testUtils.createAppModules({
          'support/logging/test': 'module.exports = { create: function() { return Array.prototype.slice.call(arguments); } }; '
        })
      })
      .then(function() {
        return waigo.initAsync({
          appFolder: testUtils.appFolder
        });
      })
      .then(function() {
        this.setup = waigo.load('support/startup/logging');
        this.app = waigo.load('application').app;
        this.app.config = {
          logging: {
            test: {
              hello: 'world'
            }
          }
        };
      })
      .nodeify(done);
  },
  afterEach: function*() {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'catches uncaught exceptions': function*() {
    

    var processOnSpy = test.mocker.spy(process, 'on');

    testUtils.spawn(function*() {
      yield* this.setup(this.app);
    })
      .then(function() {
        expect(processOnSpy.callCount).to.eql(1);
        expect(processOnSpy.getCall(0).args[0]).to.eql('uncaughtException');

        handlerFunc = processOnSpy.getCall(0).args[1];
        
        this.app.logger.error = test.mocker.spy();
        var err = new Error('test');
        handlerFunc.call(process, err);

        this.app.logger.error.should.have.been.calledOnce;
        this.app.logger.error.should.have.been.calledWithExactly('Uncaught exception', err.stack);
      })
      .nodeify(done);
  },
  'catches app error events': function*() {
    

    var appOnSpy = test.mocker.spy(this.app, 'on');

    testUtils.spawn(function*() {
      yield* this.setup(this.app);
    })
      .then(function() {
        expect(appOnSpy.callCount).to.eql(1);
        expect(appOnSpy.getCall(0).args[0]).to.eql('error');

        handlerFunc = appOnSpy.getCall(0).args[1];
        
        this.app.logger.error = test.mocker.spy();
        var err = new Error('test');
        handlerFunc.call(this.app, err);

        this.app.logger.error.should.have.been.calledOnce;
        this.app.logger.error.should.have.been.calledWithExactly(err.stack);
      })
      .nodeify(done);      
  }
};
