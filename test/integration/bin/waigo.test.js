"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


const pathToBin = path.join(process.cwd(), 'bin', 'waigo');
 

const execBin = function(args) {
  return new Q((resolve, reject) => {
    let ret = shell.exec('node ' + pathToBin + ' ' + args, {
      silent: true
    });

    if (0 !== ret.code) {
      reject(new Error('Exit: ' + ret.code));
    } else {
      resolve(ret.output);
    }
  })
};




test['cli executable'] = {
  beforeEach: function*() {
    yield this.initApp();
  },

  'help usage': function*() {
    let ret = yield execBin('--help');

    ret.should.contain('Usage:');
  },

  'version string': function*() {
    let ret = yield execBin('--version');

    ret.should.eql(
      require(path.join(process.cwd(), 'package.json')).version + "\n"
    );
  },

  'delegates to local Waigo module': {
    beforeEach: function*() {
      this.pathToLocalWaigoModule = path.join(
        process.cwd(), 'node_modules', 'waigo'
      );

      var pathToLocalWaigoModuleBinFolder = path.join(
        this.pathToLocalWaigoModule, 'bin'
      );

      this._setupTestExecutable = (contents) => {
        var pathToLocalBin = 
          path.join(pathToLocalWaigoModuleBinFolder, 'waigo-cli.js');

        this.createFolder(pathToLocalWaigoModuleBinFolder);

        this.writeFile(pathToLocalBin,contents);
        this.chmodFile(pathToLocalBin, '0755');
      };
    },
    afterEach: function*() {
      this.deleteFolder(this.pathToLocalWaigoModule);
    },
    'exits without error': function*() {
      this._setupTestExecutable("console.log('hello world')");

      let ret = yield execBin();

      ret.should.eql("hello world\n");
    },
    'exits with error': function*() {
      this._setupTestExecutable("process.exit(129)");

      yield this.shouldThrow(execBin(), 'Exit: 129');
    }
  },


  'run a command': {
    beforeEach: function*() {
      var self = this;

      this.testCliCommandFilePath = 
        path.join(process.cwd(), 'src', 'cli', '__test.js');

      let contents = this.readFile(path.join(__dirname, '__test.cli-command.js'))

      this.writeFile(self.testCliCommandFilePath, contents);
    },
    afterEach: function*() {
      this.deleteFile(this.testCliCommandFilePath);
    },

    'default': function*() {
      let ret = yield execBin('__test');

      ret.should.eql("TEST COMMAND INVOKED!\n");
    },
  },
};

