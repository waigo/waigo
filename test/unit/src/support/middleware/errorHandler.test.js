var co = require('co'),
  moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


var errors = null,
  errorHandler = null;


test['error handler middleware'] = {
  beforeEach: function(done) {
    waigo.__modules = {};
    waigo.initAsync()
      .then(function() {
        errors = waigo.load('support/errors');
        errorHandler = waigo.load('support/middleware/errorHandler');
      })
      .nodeify(done);
  },

  'returns middleware': function() {
    var fn = errorHandler();

    expect(testUtils.isGeneratorFunction(fn)).to.be.true;
  },

  'default handling': function(done) {
    var fn = errorHandler();

    var ctx = {
      app: waigo.load('application').app
    };
    ctx.app.logger = {
      error: test.mocker.spy()
    };

    var e = new errors.RuntimeError('bla bla bla', 403);

    testUtils.spawn(fn, ctx, function*(){ 
      throw e;
    })
      .then(function() {
        ctx.status.should.eql(403);
        ctx.body.should.eql({
          type: 'RuntimeError',
          msg: 'bla bla bla'
        });
        expect(ctx.body.stack).to.be.undefined;
        ctx.type.should.eql('json');

        ctx.app.logger.error.should.have.been.calledOnce;
        ctx.app.logger.error.should.have.been.calledWithExactly(e.stack);
      })
      .nodeify(done);
  },

  'show stack': function(done) {
    var app = waigo.load('application').app;
    
    var fn = errorHandler({
      showStack: true
    });

    var ctx = {
      app: app
    };
    ctx.app.logger = {
      error: test.mocker.spy()
    };

    var e = new errors.RuntimeError('bla bla bla', 403);

    testUtils.spawn(fn, ctx, function*(){ 
      throw e;
    })
      .then(function() {
        expect(ctx.body.stack).to.not.be.undefined;
      })
      .nodeify(done);
  }

};
