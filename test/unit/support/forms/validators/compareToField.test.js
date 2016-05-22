"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


let validator = null,
  validationResult = undefined;


test['compareToFielda'] = {
  beforeEach: function*() {
    yield this.initApp();

    validator = waigo.load('support/forms/validators/compareToField');

    let form = waigo.load('support/forms/form'),
      field = waigo.load('support/forms/field');

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'number'
        },
        {
          name: 'field2',
          type: 'number'
        },
      ]
    });

    this.field = this.form.fields.field2;

  },

  'field not found': function*() {
    let fn = validator({
      field: 'blah'
    });

    yield this.shouldThrow(fn(null, this.field, 1), `Comparison field not found: blah`);
  },

  'gte': function*() {
    let fn = validator({
      field: 'field1',
      comparison: 'gte',
    });

    yield this.form.setValues({
      field1: 1,
    });

    yield this.shouldThrow(fn(null, this.field, 0), 'Must be greater than or equal to field1');
    yield fn(null, this.field, 1);
    yield fn(null, this.field, 2);
  },

  'lte': function*() {
    let fn = validator({
      field: 'field1',
      comparison: 'lte',
    });

    yield this.form.setValues({
      field1: 1,
    })

    yield this.shouldThrow(fn(null, this.field, 2), 'Must be less than or equal to field1');
    yield fn(null, this.field, 1);
    yield fn(null, this.field, 0);
  },

  'gt': function*() {
    let fn = validator({
      field: 'field1',
      comparison: 'gt',
    });

    yield this.form.setValues({
      field1: 1,
    })

    yield this.shouldThrow(fn(null, this.field, 0), 'Must be greater than field1');
    yield this.shouldThrow(fn(null, this.field, 1), 'Must be greater than field1');
    yield fn(null, this.field, 2);
  },

  'lt': function*() {
    let fn = validator({
      field: 'field1',
      comparison: 'lt',
    });

    yield this.form.setValues({
      field1: 1,
    });

    yield this.shouldThrow(fn(null, this.field, 2), 'Must be less than field1');
    yield this.shouldThrow(fn(null, this.field, 1), 'Must be less than field1');
    yield fn(null, this.field, 0);
  },

  'eq': function*() {
    let fn = validator({
      field: 'field1',
      comparison: 'eq',
    });

    yield this.form.setValues({
      field1: 1,
    })

    yield this.shouldThrow(fn(null, this.field, 0), 'Must be equal to field1');
    yield fn(null, this.field, 1);
    yield this.shouldThrow(fn(null, this.field, 2), 'Must be equal to field1');
  },

  'neq': function*() {
    let fn = validator({
      field: 'field1',
      comparison: 'neq',
    });

    yield this.form.setValues({
      field1: 1,
    })

    yield fn(null, this.field, 0);
    yield this.shouldThrow(fn(null, this.field, 1), 'Must not be equal to field1');
    yield fn(null, this.field, 2);
  },
};
