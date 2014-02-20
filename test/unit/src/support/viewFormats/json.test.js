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


var json = null;


test['json'] = {
  beforeEach: function(done) {
    waigo.initAsync()
      .then(function() {
        json = waigo.load('support/viewFormats/json');
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

      new Promise(function(resolve, reject) {
        co(function*() {
          yield* render.call(ctx, 'test', 'bla');
        })(function(err) {
          try {
            expect(err.toString()).to.eql('BaseError: Plain object required for JSON view format');
            resolve();
          } catch(err2) {
            reject(err2);
          }
        });
      })
        .nodeify(done);
    },
    'renders JSON': function(done) {
      var render = this.render, 
        ctx = this.ctx;

      var theCall = Promise.promisify(co(function*() {
        yield* render.call(ctx, 'test', {
          hello: 'world'
        });
      }));

      theCall()
        .then(function() {
          expect(ctx.body).to.eql({
            hello: 'world'
          });                     
          expect(ctx.type).to.eql('json');                     
        })
        .nodeify(done);
    }
  }
};
