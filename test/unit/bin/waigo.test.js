var _ = require('lodash'),
  moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird'),
  shell = require('shelljs');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;



var pathToBin = path.join(__dirname, '..', '..', '..', 'bin', 'waigo');

var execBin = function(args) {
  var defer = Promise.defer();

  shell.exec(pathToBin + ' ' + args, function(code, output) {
    if (0 !== code) {
      defer.reject(new Error('Exit: ' + code));
    } else {
      defer.resolve(output);
    }
  });

  return defer.promise;
};





test['cli executable'] = {
  beforeEach: function(done) {
    testUtils.deleteTestFolders()
      .then(function() {
        return testUtils.createTestFolders();
      })
      .then(waigo.initAsync)
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },

  'help usage': function(done) {
    expect(execBin('--help')).to.eventually.contain('Usage:').and.notify(done);
  },

  'version string': function(done) {
    expect(execBin('--version')).to.eventually.eql(
      require(path.join(process.cwd(), 'package.json')).version + "\n"
    ).and.notify(done);
  },

  'delegates to local Waigo module': {
    beforeEach: function() {
      this.pathToLocalWaigoModule = path.join(
        process.cwd(), 'node_modules', 'waigo'
      );

      var pathToLocalWaigoModuleBinFolder = path.join(
        this.pathToLocalWaigoModule, 'bin'
      );

      this._setupTestExecutable = function(contents) {
        var pathToLocalBin = 
          path.join(pathToLocalWaigoModuleBinFolder, 'waigo');

        return testUtils.createFolder(pathToLocalWaigoModuleBinFolder)
          .then(function() {
            return testUtils.writeFile(
              pathToLocalBin,
              contents);
          })
          .then(function() {
            return testUtils.chmodFile(pathToLocalBin, '0755');
          });
      };
    },
    afterEach: function(done) {
      testUtils.deleteFolder(this.pathToLocalWaigoModule).nodeify(done);
    },
    'exits without error': function(done) {
      this._setupTestExecutable("#!/usr/bin/env bash\necho hello world")
        .then(function() {
          return execBin();
        })
        .should.eventually.eql("hello world\n")
        .and.notify(done);
    },
    'exits with error': function(done) {
      this._setupTestExecutable("#!/usr/bin/env bash\nexit 129")
        .then(function() {
          return execBin();
        })
        .should.be.rejectedWith('Exit: 129')
        .and.notify(done);      
    }
  },


  'run a command': {
    beforeEach: function(done) {
      var self = this;

      this.testCliCommandFilePath = 
        path.join(process.cwd(), 'src', 'cli', '__test.js');

      testUtils.readFile(path.join(__dirname, '__test.cli-command.js'))
        .then(function(contents){
          testUtils.writeFile(self.testCliCommandFilePath, contents);
        })
        .nodeify(done);
    },
    afterEach: function(done) {
      testUtils.deleteFile(this.testCliCommandFilePath).nodeify(done);
    },

    'default': function(done) {
      execBin('__test')
        .should.eventually.eql("TEST COMMAND INVOKED!\n")
        .and.notify(done);
    }
  }
};

