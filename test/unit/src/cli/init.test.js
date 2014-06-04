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


var AbstractCommand = null,
  InitCommand = null;



test['init command'] = {
  beforeEach: function(done) {
    testUtils.deleteTestFolders()
      .then(function() {
        return testUtils.createTestFolders();
      })
      .then(waigo.initAsync)
      .then(function() {
        AbstractCommand = waigo.load('support/cliCommand');
        InitCommand = waigo.load('cli/init');
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },

  'inherits from base Command class': function() {
    var c = new InitCommand();
    c.should.be.instanceOf(AbstractCommand);
  },

  'construction': function() {
    var c = new InitCommand();
    expect(c.description).to.eql('Initialise and create a skeleton Waigo app');
    expect(c.options).to.eql([]);
  },

  'run - action handler': function(done) {
    var c = new InitCommand();

    var installPkgSpy = test.mocker.stub(c, 'installPkgs', function() {
      return Promise.resolve();
    })

    var copyFileSpy = test.mocker.stub(c, 'copyFile', function() {
      return Promise.resolve();
    })

    testUtils.spawn(c.run, c)
      .then(function() {
        installPkgSpy.should.have.been.calledOnce;
        installPkgSpy.should.have.been.calledWithExactly('waigo', 'co');

        expect(copyFileSpy.callCount).to.eql(4);
        var dataFolder = path.join(process.cwd(), 'src', 'cli', 'data', 'init');
        copyFileSpy.should.have.been.calledWithExactly(
          path.join(dataFolder, 'start-app.js'), 'start-app.js'
        );
        copyFileSpy.should.have.been.calledWithExactly(
          path.join(dataFolder, 'index.jade'), 'src/views/index.jade'
        );
        copyFileSpy.should.have.been.calledWithExactly(
          path.join(dataFolder, 'main.controller.js'), 'src/controllers/main.js'
        );
        copyFileSpy.should.have.been.calledWithExactly(
          path.join(dataFolder, 'routes.js'), 'src/routes.js'
        );
      })
      .nodeify(done);
  },

};
