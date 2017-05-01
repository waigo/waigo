

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigovar AbstractCommand, InitCommandtest['cli - init'] = {
  beforeEach: function *() {
    yield this.initApp()AbstractCommand = waigo.load('support/cliCommand')InitCommand = waigo.load('cli/init')},

  'inherits from base Command class': function() {
    var c = new InitCommand()c.should.be.instanceOf(AbstractCommand)},

  'construction': function() {
    var c = new InitCommand()this.expect(c.description).to.eql('Initialise and create a skeleton Waigo app')this.expect(c.options).to.eql([])},
  
  'run - need package.json present': function *() {
    var c = new InitCommand()var logSpy = this.mocker.stub(c, 'log', function() {})yield c.run()logSpy.should.have.been.calledWithExactly('Please run "npm init" first')},

  'run - action handler': function *() {
    this.writeFile(path.join(waigo.getAppFolder(), '..', 'package.json'), '')var c = new InitCommand()var installPkgSpy = this.mocker.stub(c, 'installPkgs', function() {
      return Q.resolve()})

    var copyFileSpy = this.mocker.stub(c, 'copyFile', function() {
      return Q.resolve()})yield c.run()installPkgSpy.should.have.been.calledOnceinstallPkgSpy.should.have.been.calledWithExactly(['waigo', 'semver'])this.expect(copyFileSpy.callCount).to.eql(4)const dataFolder = path.join(process.cwd(), 'src', 'cli', 'data', 'init')const waigoFolder = path.join(waigo.getWaigoFolder())const frameworkFolder = path.join(waigo.getWaigoFolder(), '..')copyFileSpy.should.have.been.calledWithExactly(
      path.join(dataFolder, 'README.md'), 'src/README.md'
    )copyFileSpy.should.have.been.calledWithExactly(
      path.join(dataFolder, '_gitignore'), '.gitignore'
    )copyFileSpy.should.have.been.calledWithExactly(
      path.join(frameworkFolder, 'start-app.js'), 'start-app.js'
    )copyFileSpy.should.have.been.calledWithExactly(
      path.join(waigoFolder, 'config', 'base.js'), 'src/config/base.js'
    )},

}