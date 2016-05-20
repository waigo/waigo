"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


let validator = null;


test['notEmpty'] = {
  beforeEach: function*() {
    yield this.initApp();

    validator = waigo.load('support/forms/validators/notEmpty');
  },

  'null': function*() {
    var fn = validator();

    co(fn(null, null, null))
      .should.be.rejectedWith('Must not be empty');
  },
  'undefined': function*() {
    var fn = validator();

    co(fn(null, null, undefined))
      .should.be.rejectedWith('Must not be empty');
  },
  'empty string': function*() {
    var fn = validator();

    co(fn(null, null, ''))
      .should.be.rejectedWith('Must not be empty');
  },
  'non-empty string': function*() {
    var fn = validator();

    co(fn(null, null, 'a'))
      .should.be.fulfilled;
  },
  'number': function*() {
    var fn = validator();

    co(fn(null, null, 0))
      .should.be.fulfilled;
  },
  'boolean: true': function*() {
    var fn = validator();

    co(fn(null, null, true))
      .should.be.fulfilled;
  },
  'boolean: false': function*() {
    var fn = validator();

    co(fn(null, null, false))
      .should.be.fulfilled;
  }
};
