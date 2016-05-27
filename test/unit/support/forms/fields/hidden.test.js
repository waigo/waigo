"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['hidden'] = {
  beforeEach: function*() {
    yield this.initApp();

    let form = waigo.load('support/forms/form'),
      field = waigo.load('support/forms/field');

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'hidden',
        },
      ]
    });

    this.field = this.form.fields.field1;
  },

  'extends text field': function*() {
    let HiddenField = waigo.load('support/forms/fields/hidden'),
      Field = waigo.load('support/forms/fields/text');

    this.field.should.be.instanceof(HiddenField);
    this.field.should.be.instanceof(Field);
  },

  'view object': function*() {
    let toViewObjectYieldable = waigo.load('support/viewObjects').toViewObjectYieldable;

    (yield toViewObjectYieldable(this.field)).type.should.eql('hidden');
  },
};


