"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


test['cookie'] = {
  beforeEach: function*() {
    yield this.initApp();
  },

  'default': function() {
    var conn = waigo.load('support/session/store/cookie').create(null, {});
    
    this.expect(conn).to.eql(null);
  }
};
