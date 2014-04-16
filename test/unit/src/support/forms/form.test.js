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


test['forms'] = {
  beforeEach: function(done) {
    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        form = waigo.load('support/forms/form');
        field = waigo.load('support/forms/field');
        errors = waigo.load('support/errors');
        viewObjectMethodName = Object.keys(waigo.load('support/mixins').HasViewObject).pop();
      })
      .nodeify(done);
  },

  'FormValidationError': {
    'extends MultipleError': function() {
      var e = new form.FormValidationError();
      e.should.be.instanceOf(errors.MultipleError);
    },
    'default toViewObject': function(done) {
      var e = new form.FormValidationError('test', 400, {
        field1: new field.FieldValidationError('field1', 400, {
          val1: new Error('blah1'),
          val2: new Error('blah2')
        }),
        field2: new field.FieldValidationError('field2', 400, {
          val1: new Error('blah3'),
          val2: new Error('blah4')
        })
      });

      var actualViewObject = null;

      testUtils.spawn(e.toViewObject, e)
        .then(function(viewObject) {
          actualViewObject = viewObject;

          var me = new errors.MultipleError('test', 400, e.errors);
          return testUtils.spawn(me.toViewObject, me);
        })
        .then(function(expectedViewObject) {
          expectedViewObject.type = 'FormValidationError';

          expect(actualViewObject).to.eql(expectedViewObject);
        })
        .nodeify(done);
    },
    'lean view object': function(done) {
      var e = new form.FormValidationError('test', 400, {
        field1: new field.FieldValidationError('field1', 400, {
          val1: new Error('blah1'),
          val2: new Error('blah2')
        }),
        field2: new field.FieldValidationError('field2', 400, {
          val1: new Error('blah3'),
          val2: new Error('blah4')
        })
      });

      testUtils.spawn(e.toViewObject, e, {
        request: {
          leanErrors: true
        }
      })
        .then(function(viewObject) {
          expect(viewObject).to.eql({
            type: 'FormValidationError',
            msg: 'test',
            fields: {
              'field1': [
                'blah1',
                'blah2'
              ],
              'field2': [
                'blah3',
                'blah4'
              ]
            }
          });
        })
        .nodeify(done);
    }
  },

  'Form': {
    'beforeEach': function() {
      this.newFieldSpy = test.mocker.stub(field.Field, 'new', function(form, def) {
        return {
          name: def.name + ' created'
        };
      });

      this.formConfig = {
        fields: [
          {
            name: 'email',
            type: 'text'
          },
          {
            name: 'age',
            type: 'number'
          },
        ]
      }

      this.form = new form.Form(this.formConfig);
    },

    'construction': {
      'initialises state': function() {
        var f = new form.Form(this.formConfig);
        expect(f.state).to.eql({ 
          email: { 
            value: null 
          }, 
          age: { 
            value: null 
          }
        });
      },

      'initialises config': function() {
        var f = new form.Form(this.formConfig);
        expect(f.config).to.eql(this.formConfig);        
      },

      'initialises fields': function() {
        var f = this.form;

        expect(f._fields).to.eql({
          email: {name: 'email created'},
          age: {name: 'age created'}
        });

        this.newFieldSpy.should.have.been.calledTwice;
        this.newFieldSpy.should.have.been.calledWithExactly(f, f.config.fields[0]);
        this.newFieldSpy.should.have.been.calledWithExactly(f, f.config.fields[1]);
      },

      'can re-use stuff from existing Form': function() {
        this.form.state = {
          email: 'test',
          age: 12
        };

        var f = new form.Form(this.form);

        expect(f.config).to.eql(this.form.config);
        expect(f._fields).to.eql(this.form.fields);

        expect(f.state).to.eql(this.form.state);
      },

      'but can pass in state to override state from existing Form': function() {
        this.form.state = {
          email: 'test',
          age: 12
        };

        var f = new form.Form(this.form, {
          email: 'blah',
          age: 23
        });

        expect(f.config).to.eql(this.form.config);
        expect(f._fields).to.eql(this.form.fields);

        expect(f.state).to.eql({
          email: 'blah',
          age: 23
        });
      }      
    },

    'get fields': function() {
      var f = this.form;
      f._fields = 'test';
      expect(f.fields).to.eql('test');
    },

    'get state': function() {
      var f = this.form;
      f._state = 'test';
      expect(f.state).to.eql('test');        
    },

    'set state': function() {
      var f = this.form;

      var state = {
        email: {
          value: 123
        },
        test: {
          value: false
        }
      };

      f.state = state;

      expect(f.state).to.eql({
        email: {
          value: 123
        },
        test: {
          value: false
        },
        age: {
          value: null
        }
      });
    },

    'set field values': function(done) {
      var f = this.form;

      var values = {};
      _.each(f.fields, function(field, name) {
        field.setSanitizedValue = function*(v) {
          values[name] = v;
        };
      });

      testUtils.spawn(function*() {
        yield f.setValues({
          email: '123',
          age: '546'
        });
      })
        .then(function() {
          expect(values).to.eql({
            email: '123',
            age: '546'
          });
        })
        .nodeify(done);
    },

    'set field original values': function(done) {
      var f = this.form;

      testUtils.spawn(function*() {
        yield f.setOriginalValues({
          email: '123',
          age: '546'
        });
      })
        .then(function() {
          expect(f.fields.email.originalValue).to.eql('123');
          expect(f.fields.age.originalValue).to.eql('546');
        })
        .nodeify(done);
    },

    'check if dirty': function() {
      var f = this.form,
        fields = f.fields;

      var emailDirty = false;
      fields.email.isDirty = function() {
        return emailDirty;
      };

      var ageDirty = false;
      fields.age.isDirty = function() {
        return ageDirty;
      };

      f.isDirty().should.be.false;

      emailDirty = true;
      ageDirty = false;
      f.isDirty().should.be.true;

      emailDirty = false;
      ageDirty = true;
      f.isDirty().should.be.true;

      emailDirty = true;
      ageDirty = true;
      f.isDirty().should.be.true;
    },

    'validate': {
      'pass': function(done) {
        var f = this.form;

        _.each(f.fields, function(field, name) {
          field.validate = function*() {};
        });

        testUtils.spawn(f.validate, f)
          .nodeify(done);
      },

      'fail': function(done) {
        var f = this.form;

        _.each(f.fields, function(field, name) {
          field.validate = function*() {
            throw new Error(name + ' failed');
          };
        });

        new Promise(function(resolve, reject) {
          testUtils.spawn(f.validate, f)
            .then(reject)
            .catch(function(err) {
              try {
                expect(err).to.be.instanceOf(form.FormValidationError);
                expect(err.errors.email.toString()).to.eql('Error: email failed');
                expect(err.errors.age.toString()).to.eql('Error: age failed');
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
      var f = this.form;
      f.config.id = 'testForm';

      _.each(f.fields, function(field, name) {
        field[viewObjectMethodName] = function*(ctx) {
          return _.extend({}, ctx, {
            name: name
          });
        };
      });

      var ctx = {
        dummy: true
      };

      testUtils.spawn(f[viewObjectMethodName], f, ctx)
        .then(function(viewObject) {
          expect(viewObject).to.eql({
            id: 'testForm',
            fields: {
              email: {
                name: 'email',
                dummy: true
              },
              age: {
                name: 'age',
                dummy: true
              }
            },
            order: ['email', 'age']
          })
        })
        .nodeify(done);
    },
  },


  'create new Form': {
    beforeEach: function() {
      var formDef = this.formDef = {};

      this.formSpy = test.mocker.spy(form, 'Form');

      this.waigoLoadStub = test.mocker.stub(waigo, 'load', function(){
        return formDef;
      });
    },

    'loads form definition to create the form': function() {
      this.formDef.dummy =  true;

      var f = form.Form.new('blah');

      this.waigoLoadStub.should.have.been.calledOnce;
      this.waigoLoadStub.should.have.been.calledWithExactly('forms/blah');

      expect(f.config).to.eql({
        id: 'blah',
        dummy: true
      });

      expect(f.state).to.eql({});
    }
  }
};
