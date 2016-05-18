"use strict";

require('co-mocha');  /* enable generator test functions */

const testUtils = require('waigo-test-utils');

const waigo = require('../src');

module.exports = function(_module) {
  return testUtils.mocha(_module, {
    extraDataAndMethods: {
      initApp: function*() {
        yield waigo.init({
          appFolder: this.appFolder,
        });

        this.application = waigo.load('application');
      }
    }
  });
};
