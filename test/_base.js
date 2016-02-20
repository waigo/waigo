var Q = require('bluebird');

waigo = require('../src');

module.exports = function(_module) {
  var _testUtils = require('waigo-test-utils')(_module);
  _testUtils.utils.waigo = waigo;

  waigo.initAsync = Q.coroutine(function*(){
    return yield* waigo.init({
      appFolder: _testUtils.utils.appFolder
    });
  });

  return _testUtils;
};
