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


test['mongo'] = {
  beforeEach: function(done) {
    var self = this;

    waigo.initAsync()
      .then(function() {
        var mongoSession = require('koa-session-mongo');
        self.createSpy = test.mocker.stub(mongoSession, 'create', function() {
          return 123;
        });
      })
      .nodeify(done);
  },

  'default': function() {
    var conn = waigo.load('support/session/store/mongo').create(null, {
      host: 'testhost',
      port: 1000,
      db: 'testdb'
    });

    expect(conn).to.eql(123);

    this.createSpy.should.have.been.calledOnce;
    this.createSpy.should.have.been.calledWithExactly({
      host: 'testhost',
      port: 1000,
      db: 'testdb'      
    });
  },

  'reuse app db': function() {
    var app = waigo.load('app');
    app.logger = { info: function() {} };
    app.db = new Date();

    waigo.load('support/session/store/mongo').create(app, {
      useAppMongooseDbConn: true
    });

    this.createSpy.should.have.been.calledOnce;
    this.createSpy.should.have.been.calledWithExactly({
      useAppMongooseDbConn: true,
      mongoose: app.db
    });
  }
};
