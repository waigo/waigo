"use strict";

const path = require('path');

require('co-mocha');  /* enable generator test functions */
const testUtils = require('waigo-test-utils');

const Q = require('bluebird');
Q.config({
  longStackTraces: true
});

const waigo = require('../src'),
  _ = waigo._;



module.exports = function(_module) {
  let test = testUtils.mocha(_module, {
    name: path.relative(process.cwd(), _module.filename),
    extraDataAndMethods: {
      shouldThrow: function*(gen, err) {
        try {
          yield gen;
        } catch (e) {
          (function() { throw e; }).should.throw(err);
          return;
        }
        
        throw new Error('Expected error not thrown: ' + err);
      },
    },
  });

  test.beforeEach = function*() {
    this.deleteTestFolders();
    this.createTestFolders();
  };

  test.afterEach = function*() {
    this.deleteTestFolders();
  };

  let tests = {};

  test.tests = tests;

  return tests;
};
