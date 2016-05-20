"use strict";

require('co-mocha');  /* enable generator test functions */
const testUtils = require('waigo-test-utils');

const waigo = require('../src');




module.exports = function(_module) {
  let test = testUtils.mocha(_module, {
    extraDataAndMethods: {
      initApp: function*() {
        waigo.reset();

        yield waigo.init({
          appFolder: this.appFolder,
        });

        this.Application = waigo.load('application');
      }
    }
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
