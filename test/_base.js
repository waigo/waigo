/**
 * @file
 * Test code utilities
 */

var _ = require('lodash'),
  sinon = require('sinon'),
  chai = require("chai"),
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  rimraf = require('rimraf');

fs = Promise.promisifyAll(fs);
rimrafAsync = Promise.promisify(rimraf);
chai.use(require('sinon-chai'));


var testUtils = {},
  dataFolder = path.join(__dirname, 'data'),
  pluginsFolder = path.join(dataFolder, 'plugins');



/**
 * Create a test object for the given module.
 * @param testModule {Object} a `module` object.
 * @return {Object} a test object.
 */
testUtils.createTest = function(testModule) {
  var test = {
    mocker: null,
    beforeEach: function() {
      test.mocker = sinon.sandbox.create();      
    },
    afterEach: function(done) {
      test.mocker.restore();
      testUtils.deletePlugins().nodeify(done);
    }
  };
  testModule.exports[require('path').basename(testModule.filename)] = test;
  return test;
}





/**
 * Create a dummy test plugin
 *
 * The content of each created module will be a string containing the plugin name.
 *
 * @param name {String} name of plugin to create.
 * @param modules {Array} CommonJS modules to create within the plugin.
 *
 * @return {Promise}
 */
testUtils.createPlugin = function(name, modules) {
  return Promise(function(resolve, reject) {
    fs.statAsync(pluginsFolder)
      .then(function pluginsFolderExists() {
        resolve();
      })
      .catch(function pluginsFolderDoesntExist(err) {
        resolve(fs.mkdirAsync(pluginsFolder));
      });
  })
    .then(function removeExistingPluginFolder() {
      var pluginFolderPath = path.join(pluginsFolder, name),
        srcFolderPath = path.join(pluginFolderPath, 'src');

      return rimrafAsync(pluginFolderPath)
        .then(function createNewPluginFolder() {
          return fs.mkdirAsync(pluginFolderPath);
        })
        .then(function createPluginSrcFolder() {
          return fs.mkdirAsync(srcFolderPath);
        })
        .then(function createModules() {
          return Promise.all(
            _.map(modules, function(moduleName) {
              var fileName = path.join(srcFolderPath, moduleName) + '.js',
                folderPath = dirname(fileName);

              return fs.mkdirAsync(folderPath)
                .then(function createModuleFile() {
                  return fs.writeFileAsync(fileName, 'module.exports="' + moduleName + '"');
                });
            })
          );
        });
    });
};




/**
 * Delete all dummy test plugins.
 *
 * @return {Promise}
 */
testUtils.deletePlugins = function() {
  return rimrafAsync(pluginsFolder);
};




module.exports = {
  assert: chai.assert,
  expect: chai.expect,
  should: chai.should(),
  utils: testUtils
};

