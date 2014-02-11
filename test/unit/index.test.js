var path = require('path'),
  waigo = require('../../index');

var testBase = require('../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  test = testBase.createTest(module);


test['app folder'] = {
  'get': function() {
    expectedAppFolder = path.join(path.dirname(process.argv[1]), 'src');
    waigo.getAppFolder().should.eql(expectedAppFolder);
  }
};






test['load']