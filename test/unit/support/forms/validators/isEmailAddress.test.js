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


var validator = null,
  validationResult = undefined;


test['isEmailAddress'] = {
  beforeEach: function(done) {
    this.spy = test.mocker.stub(require('validator'), 'isEmail', function() { 
      return validationResult; 
    });

    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        validator = waigo.load('support/forms/validators/isEmailAddress');
      })
      .nodeify(done);
  },

  'calls through to validator module isEmail()': function(done) {
    var self = this;
    var fn = validator();

    testUtils.spawn(fn, fn, null, 'test')
      .finally(function() {
        try {
          self.spy.should.have.been.calledWithExactly('test');
          done();
        } catch (err) {
          done(err);
        }
      });
  },

  'fail': function(done) {
    var self = this;

    var fn = validator();
    validationResult = false;

    testUtils.spawn(fn, fn, null, 'test')
      .should.be.rejectedWith('Must be an email address')
      .and.notify(done);
  },

  'pass': function(done) {
    var self = this;

    var fn = validator();
    validationResult = true;

    testUtils.spawn(fn, fn, null, 'test')
      .should.be.fulfilled
      .and.notify(done);
  }

};
