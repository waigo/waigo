const path = require('path'),
  shell = require('shelljs'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['cli command base class'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.Command = this.waigo.load('cli/support/command')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'construction': function *() {
    const c = new this.Command('test desc', 'blah')

    expect(c.description).to.eql('test desc')

    expect(c.options).to.eql('blah')
  },

  'run - action handler': function *() {
    const c = new this.Command()

    yield this.awaitAsync(c.run()).must.reject.with.error('Not yet implemented')
  },

  'log message': function *() {
    const spy = this.mocker.spy(console, 'log')

    new this.Command().log('test')

    spy.calledOnce.must.be.true()
    spy.calledWithExactly('[waigo-cli] test').must.be.true()
  },

  'get project root folder': function *() {
    expect(new this.Command()._getProjectFolder()).to.eql(
      path.join(process.cwd(), 'test', 'data')
    )
  },

  'get node modules folder': {
    beforeEach: function *() {
      this.mocker.stub(this.Command.prototype, '_getProjectFolder', () => {
        return this.appFolder
      })

      this.foundResult = true

      this.testSpy = this.mocker.stub(shell, 'test', () => {
        return this.foundResult
      })
    },
    'found': function *() {
      expect(new this.Command()._getNpmFolderLocation()).to.eql(
        path.join(this.appFolder, 'node_modules')
      )

      this.testSpy.calledWithExactly('-d',
        path.join(this.appFolder, 'node_modules')
      ).must.be.true()
    },
    'not found': function *() {
      this.foundResult = false

      expect(new this.Command()._getNpmFolderLocation()).to.eql(null)

      this.testSpy.calledWithExactly('-d',
        path.join(this.appFolder, 'node_modules')
      ).must.be.true()
    }
  },

  'copy file': {
    beforeEach: function *() {
      this.c = new this.Command()

      this.mocker.stub(this.c, '_getProjectFolder', () => {
        return this.appFolder
      })
    },

    default: function *() {
      const src = path.join(this.appFolder, 'test.txt'),
        dst = path.join('black', 'sheep', 'affair.txt')

      this.writeFile(src, 'hey!')

      yield this.c.copyFile(src, dst)

      const str = this.readFile(path.join(this.appFolder, dst))

      expect(str).to.eql('hey!')
    },

    'default no overwrite': function *() {
      const src = path.join(this.appFolder, 'test.txt'),
        dst = path.join('black', 'sheep', 'affair.txt')

      this.writeFile(src, 'hey!')
      this.writeFile(path.join(this.appFolder, dst), 'heya')

      yield this.c.copyFile(src, dst)

      const str = this.readFile(path.join(this.appFolder, dst))

      expect(str).to.eql('heya')
    },

    'explicitly force overwrite': function *() {
      const src = path.join(this.appFolder, 'test.txt'),
        dst = path.join('black', 'sheep', 'affair.txt')

      this.writeFile(src, 'hey!')
      this.writeFile(path.join(this.appFolder, 'dst'), 'heya')

      yield this.c.copyFile(src, dst, true)

      const str = this.readFile(path.join(this.appFolder, dst))

      expect(str).to.eql('hey!')
    },
  },

  'copy folder': {
    beforeEach: function *() {
      this.c = new this.Command()

      this.mocker.stub(this.c, '_getProjectFolder', () => {
        return this.appFolder
      })
    },
    default: function *() {
      const srcFolder = path.join(this.appFolder, 'the')

      this.writeFile(path.join(srcFolder, 'thomas', 'crown', 'affair.txt'), 'hey!')

      yield this.c.copyFolder(srcFolder, 'watch')

      const str = this.readFile(
        path.join(this.appFolder, 'watch', 'thomas', 'crown', 'affair.txt')
      )

      expect(str).to.eql('hey!')
    },
    'no overwrite': function *() {
      const srcFolder = path.join(this.appFolder, 'the')

      this.writeFile(path.join(srcFolder, 'thomas', 'crown', 'affair.txt'), 'hey!')

      const finalFile = path.join(this.appFolder, 'watch', 'master.txt')

      this.writeFile(finalFile, 'heya')

      yield this.c.copyFolder(srcFolder, 'watch')

      this.fileExists(
        path.join(this.appFolder, 'watch', 'thomas', 'crown', 'affair.txt')
      ).must.be.false()
    },
  },


  'file exists': function *() {
    const c = new this.Command()

    this.mocker.stub(c, '_getProjectFolder', () => {
      return this.appFolder
    })

    const filePath = path.join(this.appFolder, 'test.js')

    c.fileExists('test.js').must.be.false()

    this.writeFile(filePath, 'blabla')

    c.fileExists('test.js').must.be.true()
  },


  'delete file': function *() {
    const c = new this.Command()

    this.mocker.stub(c, '_getProjectFolder', () => {
      return this.appFolder
    })

    const filePath = path.join(this.appFolder, 'test.js')

    this.writeFile(filePath, 'blabla')

    yield c.deleteFile('test.js')

    const fileExists = !!shell.test('-e', filePath)

    fileExists.must.be.false()
  },


  'install NPM packages': {
    beforeEach: function *() {
      this.execSpy = this.mocker.stub(shell, 'execAsync', () => {
        return Q.resolve()
      })
    },
    'dev': function *() {
      const c = new this.Command()

      yield c.installPkgs(['foo123', 'bar123'], {
        dev: true
      })

      this.execSpy.calledOnce.must.be.true()

      this.execSpy.calledWithExactly('npm install --save-dev foo123 bar123', {
        cwd: c._getProjectFolder()
      }).must.be.true()
    },
    'normal': function *() {
      const c = new this.Command()

      yield c.installPkgs(['foo123', 'bar123'])

      this.execSpy.calledOnce.must.be.true()

      this.execSpy.calledWithExactly('npm install --save foo123 bar123', {
        cwd: c._getProjectFolder()
      }).must.be.true()
    }
  }

}
