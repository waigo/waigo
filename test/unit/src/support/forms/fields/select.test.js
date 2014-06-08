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


test['select field'] = {
  beforeEach: function(done) {
    var self = this;

    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        field = waigo.load('support/forms/field');
        select = waigo.load('support/forms/fields/select');
      })
      .nodeify(done);
  },

  'inherits from base Field class': function() {
    var f = new select.Field(123, {});
    f.should.be.instanceOf(field.Field);
  },

  'construction': {
    'calls base class constructor': function() {
      test.mocker.spy(select.Field, 'super_');

      var f = new select.Field(123, {});

      select.Field.super_.should.have.been.calledOnce;
      select.Field.super_.should.have.been.calledWithExactly(123, {});
    },

    'set up default validator': {
      'adds it to validator list': function() {
        var f = new select.Field(123, {});

        f.validators.length.should.eql(1);
      },

      'it ensures value is one of the valid options': {
        beforeEach: function() {
          var f = this._field = new select.Field(123, {
            name: 'test'
          });
          f.form = {
            state: {
              test: {
                value: null
              }
            }
          }

          test.mocker.stub(f, 'getOptions', function*() {
            return {
              1: 'item1',
              2: 'item2'
            };
          });
        },

        'when not valid': function(done) {
          this._field.value = 3;

          testUtils.spawn(this._field.validate, this._field)
            .then(function() {
              done(new Error('should not be here'));
            })
            .catch(function(err) {
              try {
                err.should.be.instanceOf(field.FieldValidationError);
                expect(_.get(err, 'errors.validOption.message')).to.eql('Must be one of: item1, item2');
                done();
              } catch (err2) {
                done(err2);
              }
            });
        },
        'when valid': function(done) {
          this._field.value = 1;

          testUtils.spawn(this._field.validate, this._field)
            .nodeify(done);
        }
      }
    }
  },


  'get options': {
    'can be generator function': function(done) {
      var f = new select.Field(123, {});

      f.config.options = function*() {
        return {
          1: 'item1',
          2: 'item2'
        };
      };

      testUtils.spawn(f.getOptions, f)
        .should.eventually.eql({
          1: 'item1',
          2: 'item2'
        })
        .and.notify(done);
    },

    'can be an array': function(done) {
      var f = new select.Field(123, {});

      f.config.options = {
        1: 'item1',
        2: 'item2'
      };

      testUtils.spawn(f.getOptions, f)
        .should.eventually.eql({
          1: 'item1',
          2: 'item2'
        })
        .and.notify(done);
    }
  },


  'to view object': function(done) {
    var f = new select.Field(123, {});

    f.config.options = {
      1: 'item1',
      2: 'item2'
    };

    var toViewObjectSpy = test.mocker.stub(field.Field.prototype, 'toViewObject', function*() {
      return {
        dummy: true
      };
    });

    var ctx = { req: false }

    testUtils.spawn(f.toViewObject, f, ctx)
      .then(function(viewObj) {
        expect(viewObj).to.eql({
          dummy: true,
          options: {
            1: 'item1',
            2: 'item2'
          }
        });

        toViewObjectSpy.should.have.been.calledOnce;
        toViewObjectSpy.should.have.been.calledWithExactly(ctx);
      })
      .nodeify(done);
  }

};
