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


var html = null,
  config = null;


test['html'] = {
  beforeEach: function(done) {
    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        return testUtils.createAppModules({
          'views/test': 'p hello!',
          'views/test_params': 'p hello #{text}!'
        });
      })
      .then(function() {
        return waigo.initAsync();
      })
      .then(function() {
        html = waigo.load('support/outputFormats/html')
        config = { 
          folder: 'views', 
          ext: 'js',
          engine: {
            'js': 'jade'
          }
        };
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },

  'returns rendering middleware': function() {
    var obj = html.create(config);
    expect(obj.render).to.be.instanceOf(Function);
  },

  'rendering': {
    beforeEach: function() {
      this.render = html.create(config).render;
      this.ctx = {
        app: {}
      };
    },
    'renders html to body': function(done) {
      var render = this.render, 
        ctx = this.ctx;

      testUtils.spawn(render, ctx, 'test_params')
        .then(function() {
          expect(ctx.body).to.eql('<p>hello !</p>');                     
          expect(ctx.type).to.eql('html');                     
        })
        .nodeify(done);
    },
    'includes template params': function(done) {
      var render = this.render, 
        ctx = this.ctx;

      testUtils.spawn(render, ctx, 'test_params', { text: 'world' })
        .then(function() {
          expect(ctx.body).to.eql('<p>hello world!</p>');                     
          expect(ctx.type).to.eql('html');                     
        })
        .nodeify(done);
    },
    'includes application-level template params': function(done) {
      var render = this.render, 
        ctx = this.ctx;

      testUtils.spawn(function*() {
        ctx.app = {
          locals: {
            text: 'sheep'
          }
        };

        yield render.call(ctx, 'test_params');
      })
        .then(function() {
          expect(ctx.body).to.eql('<p>hello sheep!</p>');                     
          expect(ctx.type).to.eql('html');                     
        })
        .nodeify(done);
    }
  }
};
