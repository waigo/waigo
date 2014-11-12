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


var json = null;


test['json'] = {
  beforeEach: function(done) {
    waigo.initAsync()
      .then(function() {
        json = waigo.load('support/outputFormats/json');
      })
      .nodeify(done);
  },

  'returns rendering middleware': function() {
    var obj = json.create();
    expect(obj.render).to.be.instanceOf(Function);
  },

  'rendering': {
    beforeEach: function() {
      this.render = json.create().render;
      this.ctx = {
        app: {}
      };
    },
    'must be plain object': function(done) {
      var render = this.render, 
        ctx = this.ctx;

      testUtils.spawn(render, ctx, 'test', 'bla')
        .should.be.rejectedWith('Plain object required for JSON output format')
        .and.notify(done);
    },
    'renders JSON': function(done) {
      var render = this.render, 
        ctx = this.ctx;

      testUtils.spawn(render, ctx, 'test', {
          hello: 'world'
      })
        .then(function() {
          expect(ctx.body).to.eql({
            hello: 'world'
          });                     
          expect(ctx.type).to.eql('json');                     
        })
        .nodeify(done);
    },
  },

  'redirect': {
    beforeEach: function() {
      this.redirect = json.create().redirect;
      this.ctx = {
        app: {}
      };
    },
    'must be plain object': function(done) {
      var redirect = this.redirect, 
        ctx = this.ctx;

      testUtils.spawn(redirect, ctx, 'test')
        .then(function() {
          expect(ctx.body).to.eql({
            redirectTo: 'test'
          });                     
          expect(ctx.type).to.eql('json');
          expect(ctx.status).to.eql(200);
        })
        .nodeify(done);
    },

  },
};
