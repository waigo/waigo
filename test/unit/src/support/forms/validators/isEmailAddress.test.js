var _ = require('lodash'),
  co = require('co'),
  moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


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

    testUtils.spawn(fn, fn, null, null, 'test')
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

    testUtils.spawn(fn, fn, null, null, 'test')
      .should.be.rejectedWith('Must be an email address')
      .and.notify(done);
  },

  'pass': function(done) {
    var self = this;

    var fn = validator();
    validationResult = true;

    testUtils.spawn(fn, fn, null, null, 'test')
      .should.be.fulfilled
      .and.notify(done);
  }

};
