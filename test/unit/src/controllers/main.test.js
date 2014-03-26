var path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


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
