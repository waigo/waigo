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


var form = null,
  field = null,
  errors = null,
  viewObjectMethodName = null;


test['form fields'] = {
  beforeEach: function(done) {
    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        return testUtils.createAppModules({
          'support/forms/sanitizers/test': 'module.exports = function() { return function*(fo,fi,v) { return v; }; };',
          'support/forms/sanitizers/test_wo': 'module.exports = function(o) { return function*(fo,fi,v) { return [o, v]; }; };',
          'support/forms/validators/testv': 'module.exports = function() { return function*(fo,fi,v) { return v; }; };',
          'support/forms/validators/testv_wo': 'module.exports = function(o) { return function*(fo,fi,v) { return [o, v]; }; };'
        });
      })
      .then(function() {
        waigo.__modules = {};
        return waigo.initAsync();
      })
      .then(function() {
        form = waigo.load('support/forms/form');
        field = waigo.load('support/forms/field');
        errors = waigo.load('support/errors');
        viewObjectMethodName = waigo.load('support/viewObjects').methodName;
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },

  'FieldValidationError': {
    'extends MultipleError': function() {
      var e = new field.FieldValidationError();
      e.should.be.instanceOf(errors.MultipleError);
    },
  },

  'FieldSanitizationError': {
    'extends RuntimeError': function() {
      var e = new field.FieldSanitizationError();
      e.should.be.instanceOf(errors.RuntimeError);
    }
  },

  'Field': {
    beforeEach: function() {
      this.form = new form.Form({
        fields: [
          {
            name: 'name',
            type: 'text'
          }
        ]
      }, {
        test: {}        
      });

      this.field = new field.Field(this.form, {
        name: 'test'
      });      
    },

    'construction': {
      'sets properties': function() {
        var f = new field.Field(this.form, {});
        expect(f.form).to.eql(this.form);        
        expect(f.config).to.eql({});
        expect(f.sanitizers).to.eql([]);
        expect(f.validators).to.eql([]);
      },

      'initialises sanitizers': function(done) {
        var f = new field.Field(this.form, {
          sanitizers: ['test', { id: 'test_wo', option1: true }]
        });

        expect(f.sanitizers.length).to.eql(2);

        expect(f.sanitizers[0].id).to.eql('test');
        var fn1 = f.sanitizers[0].fn;

        expect(f.sanitizers[1].id).to.eql('test_wo');
        var fn2 = f.sanitizers[1].fn;

        testUtils.spawn(function*() {
          return [
            yield fn1(null, null, 256),
            yield fn2(null, null, 512)
          ];
        })
          .then(function(results) {
            expect(results[0]).to.eql(256);
            expect(results[1]).to.eql([
              { id: 'test_wo', option1: true },
              512
            ]);
          })
          .nodeify(done);
      },

      'initialises validators': function(done) {
        var f = new field.Field(this.form, {
          validators: ['testv', { id: 'testv_wo', option1: true }]
        });

        expect(f.validators.length).to.eql(2);

        expect(f.validators[0].id).to.eql('testv');
        var fn1 = f.validators[0].fn;

        expect(f.validators[1].id).to.eql('testv_wo');
        var fn2 = f.validators[1].fn;

        testUtils.spawn(function*() {
          return [
            yield fn1(null, null, 256),
            yield fn2(null, null, 512)
          ];
        })
          .then(function(results) {
            expect(results[0]).to.eql(256);
            expect(results[1]).to.eql([
              { id: 'testv_wo', option1: true },
              512
            ]);
          })
          .nodeify(done);
      }
    },

    'get name': function() {
      var f = new field.Field(this.form, {
        name: 'test'
      });

      f.name.should.eql('test');
    },

    'get value': function() {
      var f = new field.Field(this.form, {
        name: 'test'
      });

      this.form.state.test = {
        value: 'blah'
      };

      f.value.should.eql('blah');
    },

    'set value': function() {
      var f = new field.Field(this.form, {
        name: 'test'
      });

      this.form.state.test = {
        value: 'blah'
      };

      f.value = 'ah';

      this.form.state.test.should.eql({
        value: 'ah'
      });
    },

    'get/set original value': function() {
      var f = new field.Field(this.form, {
        name: 'test'
      });

      f.originalValue = 'ah';
      f.originalValue.should.eql('ah');
    },

    'check if dirty': function() {
      var f = new field.Field(this.form, {
        name: 'test'
      });

      f.value = 'ah';

      f.isDirty().should.be.true;

      f.originalValue = 'ah';

      f.isDirty().should.be.false;

      f.value = 'blah';

      f.isDirty().should.be.true;
    },

    'set sanitized value': {
      'sanitization pass': function(done) {
        var f = this.field;

        f.sanitizers = [
          {
            id: 'test',
            fn: function*(field, v) {
              return v + '123';
            }
          }
        ]

        testUtils.spawn(f.setSanitizedValue, f, 'abc')
          .then(function() {
            expect(f.value).to.eql('abc123');
          })
          .nodeify(done);
      },
      'sanitization fail': function(done) {
        var f = this.field;

        f.sanitizers = [
          {
            id: 'test',
            fn: function*(field, v) {
              throw new Error('blah');
            }
          }
        ]

        new Promise(function(resolve, reject){
          testUtils.spawn(f.setSanitizedValue, f, 'abc')
            .catch(function(err) {
              try {
                err.should.be.instanceOf(field.FieldSanitizationError);
                err.message.should.eql('blah');
              } catch (err2) {
                reject(err2);
              }
            })
            .then(reject);
        })
          .nodeify(done);
      }      
    },


    'validate': {
      'pass': function(done) {
        var f = this.field;

        f.validators = [
          {
            id: 'testv',
            fn: function*(field, v) {}
          }
        ];

        testUtils.spawn(f.validate, f)
          .nodeify(done);
      },

      'fail': function(done) {
        var f = this.field;

        f.validators = [
          {
            id: 'testv',
            fn: function*(field, v) {
              throw new Error('blah');
            }
          }
        ];

        new Promise(function(resolve, reject) {
          testUtils.spawn(f.validate, f)
            .then(reject)
            .catch(function(err) {
              try {
                expect(err).to.be.instanceOf(field.FieldValidationError);
                expect(err.errors.testv.toString()).to.eql('Error: blah');
                resolve();
              } catch (err2) {
                reject(err2);
              }
            });
        })
          .nodeify(done);
      }      
    },

    'to view object': function(done) {
      var f = this.field;
      f.config.type = 'text';
      f.config.label = 'Name';
      f.config.helpText = 'bla bla bla';
      f.config.meta = {
        multiline: true,
        dummyKey: 1,
      };
      f.value = 87;
      f.originalValue = 98;

      testUtils.spawn(f[viewObjectMethodName], f)
        .then(function(viewObject) {
          expect(viewObject).to.eql({
            type: 'text',
            name: 'test',
            label: 'Name',
            helpText: 'bla bla bla',
            meta: {
              multiline: true,
              dummyKey: 1,
            },
            value: 87,
            originalValue: 98
          });
        })
        .nodeify(done);
    }
  },

  'create new Field': {
    'loads field class and constructs and instance': function() {
      var newForm = new form.Form({
        fields: [{
          name: 'blah2',
          type: 'text'
        }]
      });
      var f = field.Field.new(newForm, {
        name: 'blah',
        type: 'text'
      });

      f.should.be.instanceOf(field.Field);
      f.should.be.instanceOf(waigo.load('support/forms/fields/text').Field);

      expect(f.config).to.eql({
        name: 'blah',
        type: 'text'
      });
    }
  }

};
