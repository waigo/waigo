var moment = require('moment'),
  path = require('path'),
  Q = require('bluebird'),
  winston = require('winston');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


test['create logger'] = {
  beforeEach: function(done) {
    waigo.initAsync().nodeify(done);
  },

  'default': function() {
    var logger = waigo.load('support/logging/winston').create({});

    expect(logger).to.be.instanceOf(winston.Logger);
    logger.transports.should.eql({});
  },

  'console': function() {
    var logger = waigo.load('support/logging/winston').create({
      console: {
        timestamp: true
      }
    });

    expect(logger).to.be.instanceOf(winston.Logger);
    logger.transports.console.should.be.instanceOf(winston.transports.Console);
  },

  'mongo': function() {
    var logger = waigo.load('support/logging/winston').create({
      console: {}
    });

    expect(logger).to.be.instanceOf(winston.Logger);
    logger.transports.console.should.be.instanceOf(winston.transports.Console);
  }
};
