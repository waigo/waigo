var _ = require('lodash'),
  moment = require('moment'),
  path = require('path'),
  Q = require('bluebird'),
  shell = require('shelljs');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


var Command = null;



test['cli command base class'] = {
  beforeEach: function*() {
    testUtils.deleteTestFolders()
      .then(function() {
        return testUtils.createTestFolders();
      })
      .then(waigo.initAsync)
      .then(function() {
        Command = waigo.load('support/cliCommand');
      })
      .nodeify(done);
  },
  afterEach: function*() {
    testUtils.deleteTestFolders().nodeify(done);
  },

  'construction': function() {
    var c = new Command('test desc', 'blah');
    c.description.should.eql('test desc');
    c.options.should.eql('blah');
  },

  'run - action handler': function*() {
    var c = new Command();

    testUtils.spawn(c.run, c)
      .should.be.rejectedWith("Not yet implemented")
      .and.notify(done);
  },

  'log message': function() {
    var spy = test.mocker.spy(console, 'log');

    new Command().log('test');

    spy.should.have.been.calledOnce;
    spy.should.have.been.calledWithExactly('[waigo-cli] test');
  },


  'get project root folder': function() {
    expect(new Command()._getProjectFolder()).to.eql(process.cwd());
  },


  'get node modules folder': {
    beforeEach: function() {
      var self = this;
      
      test.mocker.stub(Command.prototype, '_getProjectFolder', function() {
        return testUtils.appFolder;
      });

      this.foundResult = true;
      this.testSpy = test.mocker.stub(shell, 'test', function() {
        return self.foundResult;
      });
    },
    'found': function() {
      expect(new Command()._getNpmFolderLocation()).to.eql(
        path.join(testUtils.appFolder, 'node_modules')
      );

      this.testSpy.should.have.been.calledWithExactly('-d', 
        path.join(testUtils.appFolder, 'node_modules'));
    },
    'not found': function() {
      this.foundResult = false;
      expect(new Command()._getNpmFolderLocation()).to.eql(null);

      this.testSpy.should.have.been.calledWithExactly('-d', 
        path.join(testUtils.appFolder, 'node_modules'));
    }
  },

  'copy file': function*() {
    var c = new Command();

    test.mocker.stub(c, '_getProjectFolder', function() {
      return testUtils.appFolder;
    });

    var src = path.join(testUtils.appFolder, 'test.txt'),
      dst = path.join('black', 'sheep', 'affair.txt');

    testUtils.writeFile(src, 'hey!')
      .then(function() {
        return testUtils.spawn(c.copyFile, c, src, dst);
      })
      .then(function() {
        return testUtils.readFile(path.join(testUtils.appFolder, dst));
      })
      .should.eventually.eql('hey!')
      .notify(done);
  },



  'install NPM packages': {
    'already exists': function*() {
      var c = new Command();

      var npmFolder = c._getNpmFolderLocation();

      var testSpy = test.mocker.stub(shell, 'test', function() {
        return true;
      });

      var execSpy = test.mocker.stub(shell, 'execAsync', function() {
        return Q.resolve();
      });

      testUtils.spawn(c.installPkgs, c, 'foo123', 'bar123')
        .then(function() {
          testSpy.should.have.been.calledWithExactly('-d', 
              path.join(npmFolder, 'foo123'));

          testSpy.should.have.been.calledWithExactly('-d', 
              path.join(npmFolder, 'bar123'));

          execSpy.should.have.been.notCalled;
        })
        .nodeify(done);    
      
    },
    'does not yet exist': function*() {
      var c = new Command();

      test.mocker.stub(c, '_getNpmFolderLocation', function() {
        return testUtils.appFolder;
      });

      var testSpy = test.mocker.stub(shell, 'test', function(type, n) {
        var t = n.split('/');
        return ('foo123' === t[t.length-1]);
      });

      var execSpy = test.mocker.stub(shell, 'execAsync', function() {
        return Q.resolve();
      });

      testUtils.spawn(c.installPkgs, c, 'foo123', 'bar123', 'jump123')
        .then(function() {
          execSpy.should.have.been.calledOnce;
          execSpy.should.have.been.calledWithExactly('npm install bar123 jump123');
        })
        .nodeify(done);    
      
    }
  }

};
