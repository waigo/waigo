var _ = require('lodash'),
  co = require('co'),
  moment = require('moment'),
  path = require('path'),
  Q = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


var sanitizer = null,
  sanitizerResult = undefined;


test['trim'] = {
  beforeEach: function(done) {
    this.spy = test.mocker.stub(require('validator'), 'trim', function() { 
      return sanitizerResult; 
    });

    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        sanitizer = waigo.load('support/forms/sanitizers/trim');
      })
      .nodeify(done);
  },

  'calls through to validator module trim()': function(done) {
    var self = this;
    var fn = sanitizer();

    sanitizerResult = 123;

    testUtils.spawn(fn, fn, null, 'test')
      .then(function(val) {
        self.spy.should.have.been.calledWithExactly('test');
        expect(val).to.eql(123);
      })
      .nodeify(done);
  }

};
