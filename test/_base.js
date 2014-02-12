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
  testDataFolder = path.join(__dirname, 'data');

testUtils.appFolder = path.join(testDataFolder, 'app');
testUtils.pluginsFolder = path.join(testDataFolder, 'plugins');



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
    afterEach: function() {
      test.mocker.restore();
    }
  };
  testModule.exports[require('path').basename(testModule.filename)] = test;
  return test;
}






/**
 * Create test folders.
 *
 * @return {Promise}
 */
testUtils.createTestFolders = function() {
  /*
  node-findit fails to finish for empty directories, so we create dummy files to prevent this
  https://github.com/substack/node-findit/pull/26
   */

  return Promise.all([
    fs.mkdirAsync(testUtils.pluginsFolder)
      .then(function() {
        return fs.writeFileAsync(path.join(testUtils.pluginsFolder, 'dummy'), 'hello');
      }),
    fs.mkdirAsync(testUtils.appFolder)
      .then(function() {
        return fs.writeFileAsync(path.join(testUtils.appFolder, 'dummy'), 'hello');
      }),
  ]);
};




/**
 * Delete test folders.
 *
 * @return {Promise}
 */
testUtils.deleteTestFolders = function() {
  return Promise.all([
    rimrafAsync(testUtils.pluginsFolder),
    rimrafAsync(testUtils.appFolder)
  ]);
};






/**
 * Create a dummy test plugin.
 *
 * The `testUtils.pluginsFolder` is expected to already exist.
 *
 * The content of each created module will be a string containing the plugin name.
 *
 * @param name {String} name of plugin to create.
 * @param modules {Array} CommonJS modules to create within the plugin.
 *
 * @return {Promise}
 */
testUtils.createPlugin = function(name, modules) {
  var pluginFolderPath = path.join(testUtils.pluginsFolder, name),
    srcFolderPath = path.join(pluginFolderPath, 'src');

  return rimrafAsync(pluginFolderPath)
    .then(function createNewPluginFolder() {
      return fs.mkdirAsync(pluginFolderPath);
    })
    .then(function createPluginSrcFolder() {
      return fs.mkdirAsync(srcFolderPath);
    })
    .then(function createModules() {
      modules = modules || [];

      var moduleContent = _.each(modules, function(moduleName) {
        return 'module.exports="' + moduleName + '"';
      });

      return testUtils.createModules(srcFolderPath, _.zipObject(modules, moduleContent));
    });
};




/**
 * Create modules.
 *
 * @param srcFolder {String} folder in which to create the module. Expected to exist.
 * @param modules {Object} CommonJS modules to create within the plugin. The key is the module name and the value is the 
 * module content.
 *
 * @return {Promise}
 */
testUtils.createModules = function(srcFolder, modules) {
  modules = modules || {};

  return Promise.all(
    _.map(modules, function(moduleContent, moduleName) {
      var fileName = path.join(srcFolder, moduleName) + '.js',
        folderPath = dirname(fileName);

      return fs.mkdirAsync(folderPath)
        .then(function createModuleFile() {
          return fs.writeFileAsync(fileName, moduleContent);
        });
    })
  );
};





module.exports = {
  assert: chai.assert,
  expect: chai.expect,
  should: chai.should(),
  utils: testUtils
};

