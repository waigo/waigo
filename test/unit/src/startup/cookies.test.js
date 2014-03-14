var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;



test['cookies'] = {
  beforeEach: function(done) {
    var self = this;

    waigo.initAsync({
      appFolder: testUtils.appFolder
    })
      .then(function() {
        self.setup = waigo.load('startup/cookies');
        self.app = waigo.load('server');
        self.app.config = {
          cookies: {
            keys: ['use', 'your', 'own']
          }
        };
      })
      .nodeify(done);
  },
  'sets cookie keys': function(done) {
    var self = this;

    testUtils.spawn(function*() {
      yield* self.setup(self.app);
    })
      .then(function() {
        self.app.keys.should.eql(self.app.config.cookies.keys);
      })
      .nodeify(done);
  }
};
