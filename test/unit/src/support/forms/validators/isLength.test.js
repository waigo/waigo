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


test['isLength'] = {
  beforeEach: function(done) {
    this.spy = test.mocker.spy(require('validator'), 'isLength');

    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        validator = waigo.load('support/forms/validators/isLength');
      })
      .nodeify(done);
  },

  'calls through to validator module isLength()': function(done) {
    var self = this;
    var fn = validator();

    testUtils.spawn(fn, fn, null, 'test')
      .finally(function() {
        try {
          self.spy.should.have.been.calledWithExactly('test', 0, 10000000);
          done();
        } catch (err) {
          done(err);
        }
      });
  },

  'too short': function(done) {
    var self = this;

    var fn = validator({
      min: 5
    });

    testUtils.spawn(fn, fn, null, 'test')
      .should.be.rejectedWith('Must be between 5 and 10000000 characters')
      .and.notify(done);
  },

  'too long': function(done) {
    var self = this;

    var fn = validator({
      max: 3
    });

    testUtils.spawn(fn, fn, null, 'test')
      .should.be.rejectedWith('Must be between 0 and 3 characters')
      .and.notify(done);
  },


  'pass': function(done) {
    var self = this;

    var fn = validator({
      min: 4, 
      max: 5,
    });

    testUtils.spawn(fn, fn, null, 'test')
      .should.be.fulfilled
      .and.notify(done);
  }

};
