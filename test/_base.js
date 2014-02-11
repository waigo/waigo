/**
 * @file
 * Test code utilities
 */

var sinon = require('sinon'),
  chai = require("chai");  

chai.use(require('sinon-chai'));


/**
 * Create a test object for the given module.
 * @param testModule {Object} a `module` object.
 * @return {Object} a test object.
 */
createTest = function(testModule) {
  var test = {
    mocker: null,
    beforeEach: function() {
      test.mocker = sinon.sandbox.create();      
    },
    afterEach: function() {
      test.mocker.restore();
    }
  };
  testModule.exports[require('path').basename(testModule.filename)] = test;
  return test;
}



module.exports = {
  assert: chai.assert,
  expect: chai.expect,
  should: chai.should(),
  createTest: createTest
};

