"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var Command;


test['cli command base class'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    Command = waigo.load('support/cliCommand');
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },

  'construction': function*() {
    var c = new Command('test desc', 'blah');

    c.description.should.eql('test desc');

    c.options.should.eql('blah');
  },

  'run - action handler': function*() {
    var c = new Command();

    yield this.shouldThrow(c.run(), "Not yet implemented");
  },

  'log message': function*() {
    var spy = this.mocker.spy(console, 'log');

    new Command().log('test');

    spy.should.have.been.calledOnce;
    spy.should.have.been.calledWithExactly('[waigo-cli] test');
  },

  'get project root folder': function*() {
    this.expect(new Command()._getProjectFolder()).to.eql(process.cwd());
  },

  'get node modules folder': {
    beforeEach: function*() {
      this.mocker.stub(Command.prototype, '_getProjectFolder', () => {
        return this.appFolder;
      });

      this.foundResult = true;

      this.testSpy = this.mocker.stub(shell, 'test', () => {
        return this.foundResult;
      });
    },
    'found': function*() {
      this.expect(new Command()._getNpmFolderLocation()).to.eql(
        path.join(this.appFolder, 'node_modules')
      );

      this.testSpy.should.have.been.calledWithExactly('-d', 
        path.join(this.appFolder, 'node_modules'));
    },
    'not found': function*() {
      this.foundResult = false;

      this.expect(new Command()._getNpmFolderLocation()).to.eql(null);

      this.testSpy.should.have.been.calledWithExactly('-d', 
        path.join(this.appFolder, 'node_modules'));
    }
  },

  'copy file': {
    beforeEach: function*() {
      this.c = new Command();

      this.mocker.stub(this.c, '_getProjectFolder', () => {
        return this.appFolder;
      });
    },
    
    default: function*() {
      var src = path.join(this.appFolder, 'test.txt'),
        dst = path.join('black', 'sheep', 'affair.txt');

      this.writeFile(src, 'hey!');

      yield this.c.copyFile(src, dst);

      let str = this.readFile(path.join(this.appFolder, dst));

      str.should.eql('hey!')      
    },

    'default no overwrite': function*() {
      var src = path.join(this.appFolder, 'test.txt'),
        dst = path.join('black', 'sheep', 'affair.txt');

      this.writeFile(src, 'hey!');
      this.writeFile(path.join(this.appFolder, dst), 'heya');

      yield this.c.copyFile(src, dst);

      let str = this.readFile(path.join(this.appFolder, dst));

      str.should.eql('heya'); 
    },

    'explicitly force overwrite': function*() {
      var src = path.join(this.appFolder, 'test.txt'),
        dst = path.join('black', 'sheep', 'affair.txt');

      this.writeFile(src, 'hey!');
      this.writeFile(path.join(this.appFolder, 'dst'), 'heya');

      yield this.c.copyFile(src, dst, true);

      let str = this.readFile(path.join(this.appFolder, dst));

      str.should.eql('hey!');
    },
  },

  'copy folder': {
    beforeEach: function*() {
      this.c = new Command();

      this.mocker.stub(this.c, '_getProjectFolder', () => {
        return this.appFolder;
      });
    },
    default: function*() {
      const srcFolder = path.join(this.appFolder, 'the');

      this.writeFile(path.join(srcFolder, 'thomas', 'crown', 'affair.txt'), 'hey!');

      yield this.c.copyFolder(srcFolder, 'watch');

      let str = this.readFile(
        path.join(this.appFolder, 'watch', 'thomas', 'crown', 'affair.txt')
      );

      str.should.eql('hey!')      
    },
    'no overwrite': function*() {
      const srcFolder = path.join(this.appFolder, 'the');

      this.writeFile(path.join(srcFolder, 'thomas', 'crown', 'affair.txt'), 'hey!');

      const finalFile = path.join(this.appFolder, 'watch', 'master.txt');
      
      this.writeFile(finalFile, 'heya');

      yield this.c.copyFolder(srcFolder, 'watch');

      this.fileExists(
        path.join(this.appFolder, 'watch', 'thomas', 'crown', 'affair.txt')
      ).should.be.false;
    },
  },


  'file exists': function*() {
    var c = new Command();

    this.mocker.stub(c, '_getProjectFolder', () => {
      return this.appFolder;
    });

    const filePath = path.join(this.appFolder, 'test.js');

    c.fileExists('test.js').should.be.false;

    this.writeFile(filePath, 'blabla');

    c.fileExists('test.js').should.be.true;
  },


  'delete file': function*() {
    var c = new Command();

    this.mocker.stub(c, '_getProjectFolder', () => {
      return this.appFolder;
    });

    const filePath = path.join(this.appFolder, 'test.js');

    this.writeFile(filePath, 'blabla');

    yield c.deleteFile('test.js');

    (!!shell.test('-e', filePath)).should.be.false;
  },


  'install NPM packages': {
    beforeEach: function*() {
      this.execSpy = this.mocker.stub(shell, 'execAsync', () => {
        return Q.resolve();
      });
    },
    'dev': function*() {
      var c = new Command();

      yield c.installPkgs(['foo123', 'bar123'], {
        dev: true
      });

      this.execSpy.should.have.been.calledOnce;
      this.execSpy.should.have.been.calledWithExactly('npm install --save-dev foo123 bar123');
    },
    'normal': function*() {
      var c = new Command();

      yield c.installPkgs(['foo123', 'bar123']);

      this.execSpy.should.have.been.calledOnce;
      this.execSpy.should.have.been.calledWithExactly('npm install --save foo123 bar123');
    }
  }

};
