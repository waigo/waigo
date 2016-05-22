"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['csrf'] = {
  beforeEach: function*() {
    yield this.initApp();

    let form = waigo.load('support/forms/form'),
      field = waigo.load('support/forms/field');

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'csrf',
        },
      ]
    });

    this.field = this.form.fields.field1;
  },

  'extends text field': function*() {
    let CsrfField = waigo.load('support/forms/fields/csrf'),
      HiddenField = waigo.load('support/forms/fields/hidden');

    this.field.should.be.instanceof(CsrfField);
    this.field.should.be.instanceof(HiddenField);
  },

  'view object': function*() {
    let toViewObjectYieldable = waigo.load('support/viewObjects').toViewObjectYieldable;

    yield this.field.setSanitizedValue('test');

    (yield toViewObjectYieldable({
      csrf: 'blah',
    }, this.field)).value.should.eql('blah');
  },

  'validate': {
    beforeEach: function*() {
      yield this.field.setSanitizedValue(1);

      this.csrfPass = false;

      this.ctx = {
        assertCSRF: (val) => {
          if (!this.csrfPass) {
            throw new Error('bad csrf');
          }
        },
      };
    },
    'fail': function*() {
      this.csrfPass = false;

      try {
        yield this.field.validate();
        throw -1;
      } catch (err) {
        this.expect(err.details).to.eql(['CSRF token check failed']);
      }
    },
    'pass': function*() {
      this.csrfPass = true;

      yield this.field.validate(this.ctx);
    },
  },
};


