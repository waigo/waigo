const path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['cli - init-gulp'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.AbstractCommand = this.waigo.load('cli/support/command')
    this.InitCommand = this.waigo.load('cli/init-gulp')
  },

  'inherits from base Command class': function () {
    const c = new this.InitCommand()

    expect(c).to.be.instanceOf(this.AbstractCommand)
  },

  'construction': function () {
    const c = new this.InitCommand()

    expect(c.description).to.eql('Initialise and create a Gulpfile and associated tasks for development purposes')
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

    const copyFolderSpy = this.mocker.stub(c, 'copyFolder', function () {
      return Q.resolve()
    })

    yield c.run()

    installPkgSpy.calledOnce.must.be.true()

    installPkgSpy.calledWithExactly([
      'lodash',
      'coffee-script',
      'gulp@3.9.x',
      'gulp-server-livereload',
      'gulp-if@1.2.x',
      'gulp-autoprefixer@2.1.x',
      'gulp-minify-css@0.4.x',
      'gulp-concat@2.4.x',
      'gulp-stylus@2.0.x',
      'nib',
      'rupture',
      'gulp-uglify@1.1.x',
      'gulp-util@3.0.x',
      'gulp-nodemon@1.0.x',
      'run-sequence',
      'watchify',
      'browserify',
      'vinyl-source-stream2',
      'yargs',
    ], {
      dev: true,
    }).must.be.true()

    copyFileSpy.callCount.must.eql(8)

    const frameworkFolder = path.join(this.waigo.getWaigoFolder(), '..')

    copyFileSpy.calledWithExactly(
      path.join(frameworkFolder, 'gulpfile.coffee'), 'gulpfile.coffee'
    ).must.be.true()

    copyFolderSpy.calledWithExactly(
      path.join(frameworkFolder, 'gulp', 'utils'), 'gulp/utils'
    ).must.be.true()

    ;['dev-frontend',
      'dev-server',
      'dev',
      'frontend-css',
      'frontend-img',
      'frontend-js',
      'frontend'
    ].forEach((file) => {
      copyFileSpy.calledWithExactly(
        path.join(frameworkFolder, 'gulp', `${file}.coffee`), `gulp/${file}.coffee`
      ).must.be.true()
    })
  },

}
