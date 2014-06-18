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



test['shutdown listener'] = {
  beforeEach: function(done) {
    var self = this;

    waigo.initAsync({
      appFolder: testUtils.appFolder
    })
      .then(function() {
        self.step = waigo.load('support/shutdown/listener');
        self.app = waigo.load('application').app;
        self.app.config = {
          mode: 'test',
          port: 3000,
          baseURL: 'http://dummy:4334'
        };
      })
      .nodeify(done);
  },

  'shuts down HTTP listener': function(done) {
    var self = this;

    var closed = 0;
    self.app.server = {
      close: function(cb) {
        closed += 1;
        cb();
      }
    };

    testUtils.spawn(self.step, self.step, self.app)
      .then(function() {
        closed.should.eql(1);
      })
      .nodeify(done);
  }

};
