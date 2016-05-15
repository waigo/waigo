var _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


test['waigo same as waigo loader'] = function() {
  testUtils.waigo.should.eql(require('../../src/loader'));
};


test['exports lodash'] = function() {
  testUtils.waigo._.should.eql(_);
};


test['bootstrap']