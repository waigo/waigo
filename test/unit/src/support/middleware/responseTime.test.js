var co = require('co'),
  moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


test['response time middleware'] = {
  beforeEach: function(done) {
    waigo.__modules = {};
    waigo.initAsync().nodeify(done);
  },

  'default': function() {
    expect(waigo.load('support/middleware/responseTime')).to.eql(require('koa-response-time'));
  }
};
