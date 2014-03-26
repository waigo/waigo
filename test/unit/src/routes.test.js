var Promise = require('bluebird'),
  path = require('path');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


test['routes'] = {
  beforeEach: function(done) {
    Promise.spawn(waigo.init).nodeify(done);
  },
  'defaults': function() {
    waigo.load('waigo:routes').should.eql({
      'GET /' : 'main.index'      
    });
  }
};
