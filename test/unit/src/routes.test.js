var Promise = require('bluebird');

var testBase = require('../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


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
