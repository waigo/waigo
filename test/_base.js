"use strict";

const testUtils = require('waigo-test-utils');

const waigo = require('../src');

module.exports = function(_module) {
  return testUtils.create(_module, {
    extraDataAndMethods: {
      initWaigo: function*() {
        yield waigo.init({
          appFolder: this.appFolder,
        });
      }
    }
  });
};
