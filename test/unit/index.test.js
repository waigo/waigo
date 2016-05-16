"use strict";

const _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);

const waigo = global.waigo;



test['waigo same as waigo loader'] = function*() {
  waigo.should.eql(require('../../src/loader'));
};


test['exports lodash'] = function*() {
  waigo._.should.eql(_);
};

