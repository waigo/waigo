var _ = require('lodash'),
  co = require('co'),
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


var validator = null;


test['notEmpty'] = {
  beforeEach: function(done) {
    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        validator = waigo.load('support/forms/validators/notEmpty');
      })
      .nodeify(done);
  },

  'null': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, null)
      .should.be.rejectedWith('Must not be empty')
      .and.notify(done);
  },
  'undefined': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, undefined)
      .should.be.rejectedWith('Must not be empty')
      .and.notify(done);
  },
  'empty string': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, '')
      .should.be.rejectedWith('Must not be empty')
      .and.notify(done);
  },
  'non-empty string': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, 'a')
      .should.be.fulfilled
      .and.notify(done);
  },
  'number': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, 123)
      .should.be.fulfilled
      .and.notify(done);
  },
  'boolean: true': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, true)
      .should.be.fulfilled
      .and.notify(done);
  },
  'boolean: false': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, false)
      .should.be.fulfilled
      .and.notify(done);
  }
};
