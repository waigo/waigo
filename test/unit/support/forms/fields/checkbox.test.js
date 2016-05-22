"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['number'] = {
  beforeEach: function*() {
    yield this.initApp();

    let form = waigo.load('support/forms/form'),
      field = waigo.load('support/forms/field');

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'checkbox',
        },
      ]
    });

    this.field = this.form.fields.field1;
  },

  'extends text field': function*() {
    let CheckboxField = waigo.load('support/forms/fields/checkbox'),
      Field = waigo.load('support/forms/field').Field;

    this.field.should.be.instanceof(CheckboxField);
    this.field.should.be.instanceof(Field);
  },

  'view object': function*() {
    let toViewObjectYieldable = waigo.load('support/viewObjects').toViewObjectYieldable;

    (yield toViewObjectYieldable(null, this.field)).type.should.eql('checkbox');
  },

  'sanitize': {
    'boolean - false': function*() {
      yield this.field.setSanitizedValue(false);

      this.field.value.should.eql(false);
    },
    'boolean - true': function*() {
      yield this.field.setSanitizedValue(true);

      this.field.value.should.eql(true);
    },
    'number - 0': function*() {
      yield this.field.setSanitizedValue(0);

      this.field.value.should.eql(false);
    },
    'number - 1': function*() {
      yield this.field.setSanitizedValue(1);

      this.field.value.should.eql(true);
    },
    'string - false': function*() {
      yield this.field.setSanitizedValue('false');

      this.field.value.should.eql(false);
    },
    'string - true': function*() {
      yield this.field.setSanitizedValue('true');

      this.field.value.should.eql(true);
    },
    'string - 0': function*() {
      yield this.field.setSanitizedValue('0');

      this.field.value.should.eql(false);
    },
    'string - 1': function*() {
      yield this.field.setSanitizedValue('1');

      this.field.value.should.eql(true);
    },
    'string - no': function*() {
      yield this.field.setSanitizedValue('no');

      this.field.value.should.eql(true);
    },
    'string - yes': function*() {
      yield this.field.setSanitizedValue('yes');

      this.field.value.should.eql(true);
    },
    'empty string': function*() {
      yield this.field.setSanitizedValue('');

      this.field.value.should.eql(false);      
    }
  },
};


