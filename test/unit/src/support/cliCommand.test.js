var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


var Command = null;



test['cli command base class'] = {
  beforeEach: function(done) {
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
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },

  'construction': function() {
    var c = new Command('test desc', 'blah');
    c.description.should.eql('test desc');
    c.options.should.eql('blah');
  },

  'run - action handler': function(done) {
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

  'copy file': function(done) {
    var c = new Command();

    var appFolderRelativeToProcessCwd = 
      testUtils.appFolder.substr(process.cwd().length + 1);

    var src = path.join(testUtils.appFolder, 'test.txt'),
      dst = path.join(appFolderRelativeToProcessCwd, 'black', 'sheep', 'affair.txt');

    testUtils.writeFile(src, 'hey!')
      .then(function() {
        return testUtils.spawn(c.copyFile, c, src, dst);
      })
      .then(function() {
        return testUtils.readFile(dst);
      })
      .should.eventually.eql('hey!')
      .notify(done);
  },


  'copy file': function(done) {
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




};
