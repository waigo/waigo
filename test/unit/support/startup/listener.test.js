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



test['startup listener'] = {
  beforeEach: function*() {
    

    waigo.initAsync({
      appFolder: testUtils.appFolder
    })
      .then(function() {
        this.setup = waigo.load('support/startup/listener');
        this.app = waigo.load('application').app;
        this.app.config = {
          mode: 'test',
          port: 3000,
          baseURL: 'http://dummy:4334'
        };
      })
      .nodeify(done);
  },
  'starts HTTP listener': function*() {
    

    this.app.listen = test.mocker.stub().returns('abc');
    this.app.logger = {
      info: test.mocker.stub()
    };

    testUtils.spawn(function*() {
      return yield* this.setup(this.app);
    })
      .then(function(serverInfo) {
        expect(serverInfo).to.eql('abc');

        expect(this.app.server).to.eql('abc');

        this.app.listen.should.have.been.calledOnce;
        this.app.listen.should.have.been.calledWithExactly(3000);

        this.app.logger.info.should.have.been.calledOnce;
        this.app.logger.info.should.have.been.calledWithExactly('Server listening in test mode on port 3000 (baseURL: http://dummy:4334)');
      })
      .nodeify(done);
  }
};
