"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['select'] = {
  beforeEach: function*() {
    yield this.initApp();

    let form = waigo.load('support/forms/form'),
      field = waigo.load('support/forms/field');

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'select',
          options: {
            key1: 'label1',
            key2: 'label2',
          },
        },
      ]
    });

    this.field = this.form.fields.field1;
  },

  'extends field': function*() {
    let SelectField = waigo.load('support/forms/fields/select'),
      Field = waigo.load('support/forms/field').Field;

    this.field.should.be.instanceof(SelectField);
    this.field.should.be.instanceof(Field);
  },

  'has options': {
    'object': function*() {
      this.field.config.options = {
        key1: 'label1',
        key2: 'label2',        
      };

      (yield this.field.getOptions()).should.eql({
        key1: 'label1',
        key2: 'label2',        
      });
    },
    'function': function*() {
      this.field.config.options = function*() {
        return 234;
      };

      (yield this.field.getOptions()).should.eql(234);      
    },
  },

  'view object': function*() {
    let toViewObjectYieldable = waigo.load('support/viewObjects').toViewObjectYieldable;

    this.mocker.stub(this.field, 'getOptions').returns(Q.resolve(123));

    (yield toViewObjectYieldable(this.field)).options.should.eql(123);
  },

  'validate': {
    'single-select': {
      'pass': function*() {
        yield this.field.setSanitizedValue('key1');

        yield this.field.validate();
      },
      'fail - invalid': function*() {
        yield this.field.setSanitizedValue('key3');

        try {
          yield this.field.validate();
          throw -1;
        } catch (err) {
          this.expect(err.details).to.eql(['Must be one of: label1, label2']);
        }
      },
      'fail - multi': function*() {
        yield this.field.setSanitizedValue(['key1', 'key2']);

        try {
          yield this.field.validate();
          throw -1;
        } catch (err) {
          this.expect(err.details).to.eql(['Must be one of: label1, label2']);
        }
      },
    },
    'multi-select': {
      beforeEach: function*() {
        this.field.config.multiple = true;
      },
      'pass - single': function*() {
        yield this.field.setSanitizedValue('key1');

        yield this.field.validate();
      },
      'pass - multi': function*() {
        yield this.field.setSanitizedValue(['key1', 'key2']);

        yield this.field.validate();
      },
      'fail - invalid': function*() {
        yield this.field.setSanitizedValue(['key1', 'key3']);

        try {
          yield this.field.validate();
          throw -1;
        } catch (err) {
          this.expect(err.details).to.eql(['Must be one or more of: label1, label2']);
        }
      },
    },
  },
};


