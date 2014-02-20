var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


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
    var app = waigo.load('server');
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
