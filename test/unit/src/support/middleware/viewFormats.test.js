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


var viewFormats = null,
  ctx = null;


test['view formats middleware'] = {
  beforeEach: function(done) {
    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        testUtils.createAppModules({
          'support/viewFormats/html2': 'module.exports = { create: function() { return { render: function*() { yield 123; } }; } };'
        });
      })
      .then(function() {
        return waigo.initAsync();
      })
      .then(function() {
        viewFormats = waigo.load('support/middleware/viewFormats');
        ctx = {
          query: {},
          request: {},
          formats: {}
        };
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },

  'invalid format in config': function() {
    expect(function() {
      viewFormats({
        formats: {
          html3: true          
        }
      });
    }).to.throw('Module not found: support/viewFormats/html3');
  },

  'returns middleware': function() {
    var fn = viewFormats(ctx);
    expect(testUtils.isGeneratorFunction(fn)).to.be.true;
  },

  'uses default format when not specified': function(done) {
    var fn = viewFormats({
      paramName: 'format',
      default: 'json',
      formats: {
        json: true          
      }
    });

    Promise.spawn(function*() {
      yield* fn.call(ctx, Promise.resolve(true));
    })
      .then(function() {
        expect(testUtils.isGeneratorFunction(ctx.render)).to.be.true;
        expect(ctx.request.viewFormat).to.eql('json');
      })
      .nodeify(done);
  },

  'invalid format in request': function(done) {
    var fn = viewFormats({
      paramName: 'format',
      default: 'json',
      formats: {
        json: true          
      }
    });

    ctx.query.format = 'html';

    new Promise(function(resolve, reject) {
      Promise.spawn(function*() {
        yield* fn.call(ctx, true);
      })
        .then(function() {
          reject(new Error('should have failed'));
        })
        .catch(function(err){
          try {
            expect(err.message).to.eql('Invalid view format requested: html');
            expect(err.status).to.eql(400);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
    })
      .nodeify(done);
  },



  'custom format': function(done) {
    var fn = viewFormats({
      paramName: 'format',
      default: 'json',
      formats: {
        json: true,
        html2: true
      }
    });

    ctx.query.format = 'html2';

    Promise.spawn(function*() {
      yield* fn.call(ctx, Promise.resolve(true));
    })
      .then(function() {
        expect(testUtils.isGeneratorFunction(ctx.render)).to.be.true;
        expect(ctx.request.viewFormat).to.eql('html2');
      })
      .then(function() {
        Promise.promisify(co(ctx.render))()
          .then(function(value) {
            expect(value).to.eql(123);
          });
      })
      .nodeify(done);
  }

};
