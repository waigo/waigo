var path = require('path'),
  Promise = require('bluebird'),
  waigo = require('../../index');

var testBase = require('../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module);


waigo.initAsync = Promise.coroutine(waigo.init);


test['app folder'] = {
  beforeEach: function() {
    waigo.__modules = null;
  },
  'get': function() {
    expectedAppFolder = path.join(path.dirname(process.argv[1]), 'src');
    waigo.getAppFolder().should.eql(expectedAppFolder);
  }
};



test['init()'] = {
  beforeEach: function() {
    waigo.__modules = null;
  },
  'can only be called once': function(done) {
    waigo.initAsync()
      .then(function secondTime() {
        return new Promise(function(resolve, reject) {
          waigo.initAsync()
            .then(function oops() {
              throw new Error('Should not be here');
            })
            .catch(function(err) {
              err.toString().should.eql('Error: Waigo already inititialised');            
              resolve();
            });
        });
      })
      .nodeify(done);
  }
};



test['load()'] = {
  beforeEach: function() {
    waigo.__modules = null;
  },
  'fails if not inititialised': function(done){
    try {
      waigo.load();
      throw new Error('Shouldn\'t be here');
    } catch (err) {
      err.toString().should.eql('Error: Please initialise Waigo first');
      done();
    }
  }
}



