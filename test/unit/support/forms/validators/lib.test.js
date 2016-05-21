"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


let validator = null,
  validationResult = undefined;


test['lib'] = {
  beforeEach: function*() {
    yield this.initApp();

    validator = waigo.load('support/forms/validators/lib');
  },

  'invalid method': function*() {
    this.expect(() => {
      validator({
        method: 'blahblah'
      });
    }).to.throw('Invalid method: blahblah');
  },

  'calls method': function*() {
    var fn = validator({
      method: 'isLength',
      args: [3, 4],
    });

    co(fn(null, null, 'ab'))
      .should.be.rejectedWith('Validation failed: isLength');
    co(fn(null, null, 'abc'))
      .should.be.fulfilled;
    co(fn(null, null, 'abcd'))
      .should.be.rejectedWith('Must be less than or equal to 3');
    co(fn(null, null, 'abcde'))
      .should.be.rejectedWith('Validation failed: isLength');
  },
};
