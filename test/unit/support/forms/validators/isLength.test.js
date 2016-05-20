"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


let validator = null,
  validationResult = undefined;


test['isLength'] = {
  beforeEach: function*() {
    this.spy = this.mocker.spy(require('validator'), 'isLength');

    yield this.initApp();

    validator = waigo.load('support/forms/validators/isLength');
  },

  'defaults': function*() {
    var fn = validator();

    co(fn(null, null, 0)).should.be.fulfilled;
    co(fn(null, null, -1)).should.be.rejectedWith('Must be between 5 and 10000000 characters');

    co(fn(null, null, 10000000)).should.be.fulfilled;
    co(fn(null, null, 10000001)).should.be.rejectedWith('Must be between 5 and 10000000 characters');
  },

  'too short': function*() {
    var fn = validator({
      min: 5
    });

    co(fn(null, null, 'test'))
      .should.be.rejectedWith('Must be between 5 and 10000000 characters');
  },

  'too long': function*() {
    var fn = validator({
      max: 3
    });

    co(fn(null, null, 'test'))
      .should.be.rejectedWith('Must be between 0 and 3 characters');
  },


  'pass': function*() {
    var fn = validator({
      min: 4, 
      max: 5,
    });

    yield fn(null, null, 'test');
  }

};
