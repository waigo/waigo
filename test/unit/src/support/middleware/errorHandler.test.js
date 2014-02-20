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


var errorHandler = null;


test['html'] = {
  beforeEach: function(done) {
    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        errorHandler = waigo.load('support/middleware/errorHandler')
      })
      .nodeify(done);
  },

  'returns middleware': function() {
    var fn = errorHandler();

    fn.should.be.instanceof(Function);
    var gen = fn();
    gen.should.be.instanceOf(Object);
  }


};
