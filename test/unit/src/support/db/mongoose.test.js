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


test['mongoose'] = {
  beforeEach: function(done) {
    waigo.initAsync().nodeify(done);
  },

  'connects to db': function() {
    var mongoose = require('mongoose');

    var connectSpy = test.mocker.stub(mongoose, 'connect', function() {});

    var conn = waigo.load('support/db/mongoose').create({
      host: 'testhost',
      port: 1000,
      db: 'testdb'
    });

    connectSpy.should.have.been.calledOnce;
    connectSpy.should.have.been.calledWithExactly('mongodb://testhost:1000/testdb');

    conn.should.eql(mongoose.connection);
  }
};
