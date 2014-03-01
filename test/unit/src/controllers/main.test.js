var path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


test['index template'] = function(done) {
  var ctx = {
    render: test.mocker.stub().returns(Promise.resolve(1))
  };

  waigo.initAsync()
    .then(function invokeControllerMethod() {
      var controller = waigo.load('controllers/main');

      return testUtils.spawn(controller.index, ctx);
    })
    .then(function check() {
      ctx.render.should.have.been.calledOnce;
      ctx.render.should.have.been.calledWithExactly('index', { title: 'Hello world!' });
    })
    .nodeify(done);
};
