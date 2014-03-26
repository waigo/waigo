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
    }
  },

  'Form': {
    'beforeEach': function() {
      this.newFieldSpy = test.mocker.stub(field.Field, 'new', function(form, def) {
        return {
          name: def.name + ' created'
        };
      });

      this.form = new form.Form({
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
      });
    },

    'construction': {
      'initialises state': function() {
        var f = new form.Form();
        expect(f.state).to.eql({});        

        f = new form.Form(null, 123);
        expect(f.state).to.eql(123);
      },

      'initialises config': function() {
        var f = new form.Form();
        expect(f.config).to.eql({});        
        f = new form.Form(123);
        expect(f.config).to.eql(123);
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
        var f = new form.Form(this.form, 456);

        expect(f.config).to.eql(this.form.config);
        expect(f._fields).to.eql(this.form.fields);

        expect(f.state).to.not.eql(this.form.state);
        expect(f.state).to.eql(456);
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
            fields: [
              {
                dummy: true,
                name: 'email'
              },
              {
                dummy: true,
                name: 'age'
              }
            ]
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

    'loads form definition to create the form, and caches it': function() {
      this.formDef.dummy =  true;

      var f = form.Form.new('blah', 256);

      this.waigoLoadStub.should.have.been.calledOnce;
      this.waigoLoadStub.should.have.been.calledWithExactly('forms/blah');

      // this.formSpy.should.have.been.calledOnce;
      // this.formSpy.should.have.been.calledWithNew;
      // this.formSpy.should.have.been.calledWithExactly(formDef, 123);

      expect(f.state).to.eql(256);      
      expect(f.config).to.eql({
        id: 'blah',
        dummy: true
      });

      f2 = form.Form.new('blah', 512);

      this.waigoLoadStub.should.have.been.calledOnce;
      // this.formSpy.should.have.been.calledTwice;
      // this.formSpy.should.have.been.calledWithExactly(f, 512);

      expect(f.fields).to.eql(f2.fields);      
      expect(f.state).to.eql(256);      
      expect(f2.state).to.eql(512);      
    }
  }
};
