"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


let sanitizer = null;


test['trim'] = {
  beforeEach: function*() {
    yield this.initApp();

    sanitizer = waigo.load('support/forms/sanitizers/trim');
  },

  'trims string': function*() {
    var fn = sanitizer();

    this.expect(yield fn(null, '  test ')).to.eql('test');
  },

  'leaves non string stuff alone': function*() {
    var fn = sanitizer();

    this.expect(yield fn(null, 12)).to.eql(12);
    this.expect(yield fn(null, null)).to.eql(null);
    this.expect(yield fn(null, undefined)).to.eql(undefined);
    this.expect(yield fn(null, true)).to.eql(true);
    this.expect(yield fn(null, [])).to.eql([]);
    this.expect(yield fn(null, {})).to.eql({});
  }

};
