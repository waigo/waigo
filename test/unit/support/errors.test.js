"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var errors,
  viewObjects;


test['errors'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    errors = waigo.load('support/errors');
    viewObjects = waigo.load('support/viewObjects');
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'Error - view object': {
    'default': function*() {
      let err = new Error('test');

      let vo = yield viewObjects.toViewObjectYieldable(err);

      vo.should.eql({
        type: 'Error',
        msg: 'test'
      });
    },

    'with stack': function*() {
      let err = new Error('test');

      let vo = yield viewObjects.toViewObjectYieldable(err, {
        App: {
          config: {
            errors: {
              showStack: true
            }
          }
        }
      });

      vo.should.eql({
        type: 'Error',
        msg: 'test',
        stack: err.stack,
      });
    },

    'with details': function*() {
      let err = new Error('test'),
        err2 = new Error('test2');

      err.details = {
        err: err2
      };

      let vo = yield viewObjects.toViewObjectYieldable(err);

      vo.should.eql({
        type: 'Error',
        msg: 'test',
        details: {
          err: yield viewObjects.toViewObjectYieldable(err2),
        },
      });
    },
  },


  'RuntimeError': {
    'defaults': function() {
      var e = new errors.RuntimeError();

      e.should.be.instanceOf(Error);
      e.message.should.eql('An error occurred');
      e.name.should.eql('RuntimeError');
      e.status.should.eql(500);
    },
    'with params': function() {
      var e = new errors.RuntimeError('my msg', 505, {
        blah: true
      });

      e.message.should.eql('my msg');
      e.name.should.eql('RuntimeError');
      e.status.should.eql(505);
      e.details.should.eql({ blah: true });
    },
    'view object': {
      'default': function*() {
        let e2 = new errors.RuntimeError('my msg', 501);

        var e = new errors.RuntimeError('my msg', 505, {
          blah: e2,
        });

        let viewObject = yield viewObjects.toViewObjectYieldable(e);

        viewObject.should.eql({
          type: 'RuntimeError',
          msg: 'my msg',
          details: {
            blah: yield viewObjects.toViewObjectYieldable(e2)
          },
        });
      },

      'with stack': function*() {
        var e = new errors.RuntimeError('my msg', 505);

        let viewObject = yield viewObjects.toViewObjectYieldable(e, {
          App: {
            config: {
              errors: {
                showStack: true
              }
            }
          }
        });

        viewObject.should.eql({
          type: 'RuntimeError',
          msg: 'my msg',
          stack: e.stack,
        });
      },
    },
  },

  'MultipleError': {
    'defaults': function() {
      var e = new errors.MultipleError();

      e.should.be.instanceOf(errors.RuntimeError);
      e.message.should.eql('Some errors occurred');
      e.name.should.eql('MultipleError');
      e.status.should.eql(500);
      e.details.should.eql({});
    },
    'with params': function() {
      var multiErrors = {
        e1: new errors.RuntimeError()        
      };

      var e = new errors.MultipleError('blah', 505, multiErrors);

      e.message.should.eql('blah');
      e.name.should.eql('MultipleError');
      e.status.should.eql(505);
      e.details.should.eql(multiErrors);
    },
    'view object': {
      default: function*() {
        var multiErrors = {
          e1: new errors.RuntimeError('test error 1', 403),
          e2: new Error('bad'),
          e3: new errors.RuntimeError()
        };

        var e = new errors.MultipleError('blah', 404, multiErrors);

        let viewObject = yield viewObjects.toViewObjectYieldable(e);

        this.expect(viewObject).to.eql({
          type: 'MultipleError',
          msg: 'blah',
          details: {
            e1: {
              type: 'RuntimeError',
              msg: 'test error 1'
            },
            e2: {
              type: 'Error',
              msg: 'bad'
            },
            e3: {
              type: 'RuntimeError',
              msg: 'An error occurred'
            }
          }
        });        
      },
      'with stack': function*() {
        var multiErrors = {
          e1: new errors.RuntimeError('test error 1', 403),
        };

        var e = new errors.MultipleError('blah', 404, multiErrors);

        let viewObject = yield viewObjects.toViewObjectYieldable(e, {
          App: {
            config: {
              errors: {
                showStack: true
              }
            }
          }
        });

        this.expect(viewObject).to.eql({
          type: 'MultipleError',
          msg: 'blah',
          details: {
            e1: {
              type: 'RuntimeError',
              msg: 'test error 1',
              stack: multiErrors.e1.stack,
            },
          },
          stack: e.stack,
        });
      },
    },
  },

  'define new error': {
    beforeEach: function() {
      this.RuntimeError2 = errors.define('RuntimeError2');
      this.MultipleError2 = errors.define('MultipleError2', errors.MultipleError);
    },

    'defaults - RuntimeError': function() {
      var e = new this.RuntimeError2();

      e.should.be.instanceOf(errors.RuntimeError);
      e.message.should.eql('An error occurred');
      e.name.should.eql('RuntimeError2');
      e.status.should.eql(500);
    },
    'defaults - MultipleError': function() {
      var e = new this.MultipleError2();

      e.should.be.instanceOf(errors.MultipleError);
      e.message.should.eql('Some errors occurred');
      e.name.should.eql('MultipleError2');
      e.status.should.eql(500);        
    },
    'with params - RuntimeError': function() {
      var e = new this.RuntimeError2('my msg', 505);

      e.message.should.eql('my msg');
      e.name.should.eql('RuntimeError2');
      e.status.should.eql(505);
    },
    'with params - MultipleError': function() {
      var errors = {
        hello: new Error('blaze')
      };
      var e = new this.MultipleError2('my msg', 505, errors);

      e.message.should.eql('my msg');
      e.name.should.eql('MultipleError2');
      e.status.should.eql(505);
      e.details.should.eql(errors);
    },
    'view object - RuntimeError': function*() {
      var e = new this.RuntimeError2('my msg', 505);
      var eParent = new errors.RuntimeError('my msg', 505);

      let child = yield viewObjects.toViewObjectYieldable(e);
      let parent = yield viewObjects.toViewObjectYieldable(eParent);

      child.type.should.eql('RuntimeError2');
      delete child.type;
      delete parent.type;
      child.should.eql(parent);
    },
    'view object - MultipleError': function*() {
      var e = new this.MultipleError2('my msg', 505);
      var eParent = new errors.MultipleError('my msg', 505);

      let child = yield viewObjects.toViewObjectYieldable(e);
      let parent = yield viewObjects.toViewObjectYieldable(eParent);

      child.type.should.eql('MultipleError2');
      delete child.type;
      delete parent.type;
      child.should.eql(parent);
    },
  },

  'convert error to view object': {
    'Error with method to convert itself': function*() {
      var err = new Error('test');

      this.mocker.stub(err, viewObjects.METHOD_NAME, function() {
        return Q.resolve('blah');
      });

      let vo = yield viewObjects.toViewObjectYieldable(err);

      vo.should.eql('blah');
    },
    'Error without method to convert itself': function*() {
      var err = new Error('test');

      delete err[viewObjects.METHOD_NAME];

      let vo = yield viewObjects.toViewObjectYieldable(err);

      vo.should.eql({
        type: 'Error',
        msg: 'test'
      });
    },
  },
};



