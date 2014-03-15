var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;



test['listener'] = {
  beforeEach: function(done) {
    var self = this;

    waigo.initAsync({
      appFolder: testUtils.appFolder
    })
      .then(function() {
        self.setup = waigo.load('support/startup/listener');
        self.app = waigo.load('app');
        self.app.config = {
          mode: 'test',
          port: 3000,
          baseURL: 'http://dummy:4334'
        };
      })
      .nodeify(done);
  },
  'starts HTTP listener': function(done) {
    var self = this;

    self.app.listen = test.mocker.stub().returns('abc');
    self.app.logger = {
      info: test.mocker.stub()
    };

    testUtils.spawn(function*() {
      return yield* self.setup(self.app);
    })
      .then(function(serverInfo) {
        expect(serverInfo).to.eql('abc');

        self.app.listen.should.have.been.calledOnce;
        self.app.listen.should.have.been.calledWithExactly(3000);

        self.app.logger.info.should.have.been.calledOnce;
        self.app.logger.info.should.have.been.calledWithExactly('Server listening in test mode on port 3000 (baseURL: http://dummy:4334)');
      })
      .nodeify(done);
  }
};
