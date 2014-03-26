var co = require('co'),
  moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


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
