var co = require('co'),
  moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


var html = null,
  config = null;


test['html'] = {
  beforeEach: function(done) {
    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        testUtils.createAppModules({
          'views/test': 'p hello!',
          'views/test_params': 'p hello #{text}!'
        });
      })
      .then(function() {
        waigo.__modules = {};
        return waigo.initAsync();
      })
      .then(function() {
        html = waigo.load('support/viewFormats/html')
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

      var theCall = Promise.promisify(co(function*() {
        yield* render.call(ctx, 'test');
      }));

      theCall()
        .then(function() {
          expect(ctx.body).to.eql('<p>hello!</p>');                     
          expect(ctx.type).to.eql('html');                     
        })
        .nodeify(done);
    },
    'includes template params': function(done) {
      var render = this.render, 
        ctx = this.ctx;

      var theCall = Promise.promisify(co(function*() {
        yield* render.call(ctx, 'test_params', { text: 'world' });
      }));

      theCall()
        .then(function() {
          expect(ctx.body).to.eql('<p>hello world!</p>');                     
          expect(ctx.type).to.eql('html');                     
        })
        .nodeify(done);
    },
    'includes application-level template params': function(done) {
      var render = this.render, 
        ctx = this.ctx;

      var theCall = Promise.promisify(co(function*() {
        ctx.app = {
          locals: {
            text: 'sheep'
          }
        };

        yield* render.call(ctx, 'test_params');
      }));

      theCall()
        .then(function() {
          expect(ctx.body).to.eql('<p>hello sheep!</p>');                     
          expect(ctx.type).to.eql('html');                     
        })
        .nodeify(done);
    }
  }
};
