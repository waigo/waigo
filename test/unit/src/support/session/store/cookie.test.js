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


test['cookie'] = {
  beforeEach: function(done) {
    waigo.initAsync().nodeify(done);
  },

  'default': function() {
    var conn = waigo.load('support/session/store/cookie').create(null, {});
    
    expect(conn).to.eql(null);
  }
};
