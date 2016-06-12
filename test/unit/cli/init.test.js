"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');

const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;

var AbstractCommand, InitCommand;



test['cli - init'] = {
  beforeEach: function*() {
    yield this.initApp();

    AbstractCommand = waigo.load('support/cliCommand');
    InitCommand = waigo.load('cli/init');
  },

  'inherits from base Command class': function() {
    var c = new InitCommand();
    c.should.be.instanceOf(AbstractCommand);
  },

  'construction': function() {
    var c = new InitCommand();
    this.expect(c.description).to.eql('Initialise and create a skeleton Waigo app');
    this.expect(c.options).to.eql([]);
  },

  'run - action handler': function*() {
    var c = new InitCommand();

    var installPkgSpy = this.mocker.stub(c, 'installPkgs', function() {
      return Q.resolve();
    })

    var copyFileSpy = this.mocker.stub(c, 'copyFile', function() {
      return Q.resolve();
    });

    yield c.run();

    installPkgSpy.should.have.been.calledOnce;
    installPkgSpy.should.have.been.calledWithExactly(['waigo@next', 'semver']);

    this.expect(copyFileSpy.callCount).to.eql(4);

    const dataFolder = path.join(process.cwd(), 'src', 'cli', 'data', 'init');
    const waigoFolder = path.join(waigo.getWaigoFolder());
    const frameworkFolder = path.join(waigo.getWaigoFolder(), '..');

    copyFileSpy.should.have.been.calledWithExactly(
      path.join(dataFolder, 'README.md'), 'src/README.md'
    );

    copyFileSpy.should.have.been.calledWithExactly(
      path.join(dataFolder, '_gitignore'), '.gitignore'
    );

    copyFileSpy.should.have.been.calledWithExactly(
      path.join(frameworkFolder, 'start-app.js'), 'start-app.js'
    );

    copyFileSpy.should.have.been.calledWithExactly(
      path.join(waigoFolder, 'config', 'base.js'), 'src/config/base.js'
    );
  },

};
