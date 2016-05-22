"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


let validator = null;


test['isLength'] = {
  beforeEach: function*() {
    yield this.initApp();

    validator = waigo.load('support/forms/validators/numberInRange');
  },

  'too small': function*() {
    var fn = validator({
      min: 5
    });

    yield fn(null, null, 5);
    yield this.shouldThrow(fn(null, null, 4), 'Must be greater than or equal to 5');
  },

  'too big': function*() {
    var fn = validator({
      max: 3
    });

    yield fn(null, null, 3);
    yield this.shouldThrow(fn(null, null, 4), 'Must be less than or equal to 3');
  },


  'range': function*() {
    var fn = validator({
      min: 1,
      max: 3
    });

    yield fn(null, null, 1);
    yield fn(null, null, 2);
    yield fn(null, null, 3);
    yield this.shouldThrow(fn(null, null, 4), 'Must be between 1 and 3 inclusive');
  },


  'converts first': function*() {
    var fn = validator({
      min: 1,
      max: 3
    });

    yield fn(null, null, 2);
    yield this.shouldThrow(fn(null, null, 4), 'Must be between 1 and 3 inclusive');
  },



};
