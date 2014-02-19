var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


var app = null,
  routes = null,
  router = null,
  mapper = null;


var errors = null;


test['errors'] = {
  beforeEach: function(done) {
    waigo.initAsync()
      .then(function() {
        errors = waigo.load('support/errors');        
      })
      .nodeify(done);
  },

  'BaseError': {
    'defaults': function() {
      var e = new errors.BaseError();

      e.should.be.instanceOf(Error);
      e.message.should.eql('An error occurred');
      e.name.should.eql('BaseError');
      e.status.should.eql(500);
    },
    'with params': function() {
      var e = new errors.BaseError('my msg', 505);

      e.message.should.eql('my msg');
      e.name.should.eql('BaseError');
      e.status.should.eql(505);
    },
    'view object': function(done) {
      var e = new errors.BaseError('my msg', 505);

      e.toViewObject()
        .then(function(viewObject) {
          expect(viewObject).to.eql({
            type: 'BaseError',
            msg: 'my msg'
          });
        })
        .nodeify(done);
    },
    'subtypes': {
      beforeEach: function() {
        this.TestError = errors.BaseError.createSubType('TestError');
        this.TestError2 = errors.BaseError.createSubType('TestError', {
          message: 'default msg',
          status: 404
        });
      },

      'defaults': function() {
        var e = new this.TestError();

        e.should.be.instanceOf(errors.BaseError);
        e.message.should.eql('An error occurred');
        e.name.should.eql('TestError');
        e.status.should.eql(500);

        var e = new this.TestError2();

        e.should.be.instanceOf(errors.BaseError);
        e.message.should.eql('default msg');
        e.name.should.eql('TestError');
        e.status.should.eql(404);        
      },
      'with params': function() {
        var e = new this.TestError2('my msg', 505);

        e.message.should.eql('my msg');
        e.name.should.eql('TestError');
        e.status.should.eql(505);
      },
      'view object': function(done) {
        var e = new this.TestError2('my msg', 505);

        e.toViewObject()
          .then(function(viewObject) {
            expect(viewObject).to.eql({
              type: 'TestError',
              msg: 'my msg'
            });
          })
          .nodeify(done);
      }
    }
  },

  'MultipleError': {
    'defaults': function() {
      var e = new errors.MultipleError();

      e.should.be.instanceOf(errors.BaseError);
      e.message.should.eql('There were multiple errors');
      e.name.should.eql('MultipleError');
      e.status.should.eql(500);
      e.errors.should.eql({});
    },
    'with params': function() {
      var multiErrors = {
        e1: new errors.BaseError()        
      };

      var e = new errors.MultipleError(multiErrors, 505);

      e.message.should.eql('There were multiple errors');
      e.name.should.eql('MultipleError');
      e.status.should.eql(505);
      e.errors.should.eql(multiErrors);
    },
    'view object': function(done) {
      var multiErrors = {
        e1: new errors.BaseError('test error 1', 403),
        e2: new Error('bad'),
        e3: new errors.BaseError()
      };

      var e = new errors.MultipleError(multiErrors);

      e.toViewObject()
        .then(function(viewObject) {
          expect(viewObject).to.eql({
            type: 'MultipleError',
            errors: {
              e1: {
                type: 'BaseError',
                msg: 'test error 1'
              },
              e2: {
                msg: 'bad'
              },
              e3: {
                type: 'BaseError',
                msg: 'An error occurred'
              }
            }
          });
        })
        .nodeify(done);
    }    
  }
};



