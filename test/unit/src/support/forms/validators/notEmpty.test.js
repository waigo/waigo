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

    testUtils.spawn(fn, fn, null, null, null)
      .should.be.rejectedWith('Must not be empty')
      .and.notify(done);
  },
  'undefined': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, null, undefined)
      .should.be.rejectedWith('Must not be empty')
      .and.notify(done);
  },
  'empty string': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, null, '')
      .should.be.rejectedWith('Must not be empty')
      .and.notify(done);
  },
  'non-empty string': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, null, 'a')
      .should.be.fulfilled
      .and.notify(done);
  },
  'number': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, null, 123)
      .should.be.fulfilled
      .and.notify(done);
  },
  'boolean: true': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, null, true)
      .should.be.fulfilled
      .and.notify(done);
  },
  'boolean: false': function(done) {
    var fn = validator();

    testUtils.spawn(fn, fn, null, null, false)
      .should.be.fulfilled
      .and.notify(done);
  }
};
