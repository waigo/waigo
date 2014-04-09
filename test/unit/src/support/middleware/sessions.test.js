var co = require('co'),
  moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


test['sessions middleware'] = {
  beforeEach: function(done) {
    var self = this;

    testUtils.deleteTestFolders()
      .then(function() {
        return testUtils.createAppModules({
          'support/session/store/testStore': 'module.exports = { create: function(app, cfg) { return cfg; } };'
        })
      })
      .then(function() {
        waigo.__modules = {};
        return waigo.initAsync();
      })
      .then(function() {
        self.middleware = waigo.load('support/middleware/sessions');
        self.app = waigo.load('application').app;
      })
      .nodeify(done);      
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'verifies that cookie signing keys are set': function(done) {
    var self = this;

    testUtils.spawn(function*() {
      yield* self.middleware({
        app: self.app
      });
    })
      .should.be.rejectedWith('Please specify cookie signing keys (session.keys) in the config file.')
      .and.notify(done);
  },
  'default': function() {
    var self = this;

    var createStoreSpy = test.mocker.spy(waigo.load('support/session/store/testStore'),'create');

    var options = { 
      app: self.app,
      keys: ['my', 'key'],
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

    var fn = self.middleware(options);

    self.app.keys.should.eql(['my', 'key']);
    createStoreSpy.should.have.been.calledOnce;
    createStoreSpy.should.have.been.calledWithExactly(self.app, {hello: 'world'});
  }
};
