var _ = require('lodash'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module);



test['waigo same as waigo loader'] = function() {
  testBase.waigo.should.eql(require('../../src/loader'));
};
