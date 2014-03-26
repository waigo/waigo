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


var text = null,
  field = null;


test['text field'] = {
  beforeEach: function(done) {
    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        field = waigo.load('support/forms/field');
        text = waigo.load('support/forms/fields/text');
      })
      .nodeify(done);
  },

  'inherits from base Field class': function() {
    var f = new text.Field(123, {});
    f.should.be.instanceOf(field.Field);
  },

  'construction': {
    'calls base class constructor': function() {
      test.mocker.stub(text.Field, 'super_');

      var f = new text.Field(123, {});

      text.Field.super_.should.have.been.calledOnce;
      text.Field.super_.should.have.been.calledWithExactly(123, {});
    }
  }

};
