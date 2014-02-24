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


var outputFormats = null,
  ctx = null;


test['output formats middleware'] = {
  beforeEach: function(done) {
    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        testUtils.createAppModules({
          'support/outputFormats/html2': 'module.exports = { create: function() { return { render: function*() { yield 123; } }; } };'
        });
      })
      .then(function() {
        return waigo.initAsync();
      })
      .then(function() {
        outputFormats = waigo.load('support/middleware/outputFormats');
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
      outputFormats({
        formats: {
          html3: true          
        }
      });
    }).to.throw('Module not found: support/outputFormats/html3');
  },

  'returns middleware': function() {
    var fn = outputFormats(ctx);
    expect(testUtils.isGeneratorFunction(fn)).to.be.true;
  },

  'uses default format when not specified': function(done) {
    var fn = outputFormats({
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
        expect(ctx.request.outputFormat).to.eql('json');
      })
      .nodeify(done);
  },

  'invalid format in request': function(done) {
    var fn = outputFormats({
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
            expect(err.message).to.eql('Invalid output format requested: html');
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
    var fn = outputFormats({
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
        expect(ctx.request.outputFormat).to.eql('html2');
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
