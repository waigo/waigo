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


test['static resources middleware'] = {
  beforeEach: function(done) {
    waigo.__modules = {};
    waigo.initAsync().nodeify(done);
  },

  'app relative folder': function() {
    var m = waigo.load('support/middleware/staticResources');

    var pathJoinSpy = test.mocker.spy(path, 'join');

    var fn = m({
      folder: 'static'
    });

    expect(testUtils.isGeneratorFunction(fn)).to.be.true;

    pathJoinSpy.should.have.been.calledWithExactly(waigo.getAppFolder(), 'static');
  }

};
