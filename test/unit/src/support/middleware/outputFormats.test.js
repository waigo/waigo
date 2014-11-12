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


var app = null,
  outputFormats = null,
  ctx = null;


test['output formats middleware'] = {
  beforeEach: function(done) {
    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolders)
      .then(function() {
        return testUtils.createAppModules({
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
        app = waigo.load('application').app;
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

    testUtils.spawn(fn, ctx, function*(){})
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
      testUtils.spawn(fn, ctx, true)
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

    testUtils.spawn(fn, ctx, function*() {})
      .then(function() {
        expect(testUtils.isGeneratorFunction(ctx.render)).to.be.true;
        expect(ctx.request.outputFormat).to.eql('html2');
      })
      .then(function() {
        testUtils.spawn(ctx.render, ctx)
          .then(function(value) {
            expect(value).to.eql(123);
          });
      })
      .nodeify(done);
  },


  'converts locals to view objects if possible': function(done) {
    var toViewObjectMethodName = waigo.load('support/viewObjects').methodName;

    var fn = outputFormats({
      paramName: 'format',
      default: 'json',
      formats: {
        json: true
      }
    });


    var locals = {
      dummy: true,
      dummy2: {
        blah: 123
      },
      dummy3: [
        456,
        [ 1 ],
        { bar: 999 },
        {}
      ]
    };

    locals.dummy2[toViewObjectMethodName] = function*() {
      return {
        val: 55
      };
    };

    locals.dummy3[3][toViewObjectMethodName] = function*() {
      return {
        val: 77
      };
    };

    testUtils.spawn(fn, ctx, function*() {})
      .then(function() {
        expect(testUtils.isGeneratorFunction(ctx.render)).to.be.true;
      })
      .then(function() {
        return testUtils.spawn(ctx.render, ctx, null, locals)
          .then(function() {
            expect(ctx.body).to.eql({
              dummy: true,
              dummy2: {
                val: 55
              },
              dummy3: [
                456,
                [ 1 ],
                { bar: 999 },
                { val: 77 }
              ]
            });
          });
      })
      .nodeify(done);    
  },


  'redirect to url': function(done) {
    var fn = outputFormats({
      paramName: 'format',
      default: 'json',
      formats: {
        json: true
      }
    });

    testUtils.spawn(fn, ctx, function*() {})
      .then(function() {
        expect(testUtils.isGeneratorFunction(ctx.redirect)).to.be.true;
      })
      .then(function() {
        return testUtils.spawn(ctx.redirect, ctx, 'www.test.com')
          .then(function() {
            expect(ctx.body).to.eql({
              redirectTo: 'www.test.com'
            });
          });
      })
      .nodeify(done);  
  },  
};
