const path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['cli - init'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.AbstractCommand = this.waigo.load('cli/support/command')
    this.InitCommand = this.waigo.load('cli/init')
  },

  'inherits from base Command class': function () {
    const c = new this.InitCommand()

    expect(c).to.be.instanceOf(this.AbstractCommand)
  },

  'construction': function () {
    const c = new this.InitCommand()

    expect(c.description).to.eql('Initialise and create a skeleton Waigo app')
    expect(c.options).to.eql([])
  },

  'run - need package.json present': function *() {
    const c = new this.InitCommand()

    const logSpy = this.mocker.stub(c, 'log', function () {})

    yield c.run()

    logSpy.calledWithExactly('Please run "npm init" first').must.be.true()
  },

  'run - action handler': function *() {
    this.writeFile(path.join(this.waigo.getAppFolder(), '..', 'package.json'), '')

    const c = new this.InitCommand()

    const installPkgSpy = this.mocker.stub(c, 'installPkgs', function () {
      return Q.resolve()
    })

    const copyFileSpy = this.mocker.stub(c, 'copyFile', function () {
      return Q.resolve()
    })

    yield c.run()

    installPkgSpy.calledOnce.must.be.true()
    installPkgSpy.calledWithExactly(['waigo', 'semver']).must.be.true()

    copyFileSpy.callCount.must.eql(4)

    const dataFolder = path.join(process.cwd(), 'src', 'cli', 'data', 'init')
    const waigoFolder = path.join(this.waigo.getWaigoFolder())
    const frameworkFolder = path.join(this.waigo.getWaigoFolder(), '..')

    copyFileSpy.calledWithExactly(
      path.join(dataFolder, 'README.md'), 'src/README.md'
    ).must.be.true()

    copyFileSpy.calledWithExactly(
      path.join(dataFolder, '_gitignore'), '.gitignore'
    ).must.be.true()

    copyFileSpy.calledWithExactly(
      path.join(frameworkFolder, 'start-app.js'), 'start-app.js'
    ).must.be.true()

    copyFileSpy.calledWithExactly(
      path.join(waigoFolder, 'config', 'base.js'), 'src/config/base.js'
    ).must.be.true()
  },

}
