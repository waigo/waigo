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


var form = null,
  errors = null;


test['Form'] = {
  beforeEach: function(done) {
    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        form = waigo.load('support/forms/form');
        errors = waigo.load('support/errors');
      })
      .nodeify(done);
  },

  'FormValidationError': {
    'extends MultipleError': function() {
      var e = new form.FormValidationError();
      e.should.be.instanceOf(errors.MultipleError);
    }
  }

};
