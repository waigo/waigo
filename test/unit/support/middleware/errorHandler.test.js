"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var middleware = null,
  errors = null;


test['context helpers'] = {
  beforeEach: function*() {
    middleware = null;

    this._init = this.bind(function*() {
      yield this.initApp();

      yield this.startApp({
        startupSteps: ['db', 'models'],
        shutdownSteps: ['db'],
      });

      middleware = waigo.load('support/middleware/errorHandler');
      errors = waigo.load('support/errors');
    }, this);
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'throw()': {
    beforeEach: function*() {
      yield this._init();

      this.ctx = {
        App: this.App,
      };

      yield middleware().call(this.ctx, Q.resolve());
    },
    'default': function*() {
      try {
        this.ctx.throw('default error', 502);
        throw -1;
      } catch (err) {
        err.should.be.instanceof(errors.RuntimeError);
        err.status.should.eql(502);
        err.message.should.eql('default error');
      }
    },
    'custom class': function*() {
      let MyError = errors.define('MyError');

      try {
        this.ctx.throw(MyError, 'default error', 502);
        throw -1;
      } catch (err) {
        err.should.be.instanceof(MyError);
        err.status.should.eql(502);
        err.message.should.eql('default error');
      }
    },
  },

  'renders error page': {
    beforeEach: function*() {
      yield this._init();

      this.ctx = {
        App: this.App,
        request: {
          url: '/test',
          method: 'del',
        },
        render: this.mocker.spy(() => Q.resolve()),
      };
    },

    'error page ok': function*() {
      yield middleware().call(this.ctx, function*() {
        throw new errors.RuntimeError('mega', 502, {
          dummy: true,
        });
      });

      this.ctx.render.should.have.been.calledWith('error');
      let err = this.ctx.render.getCall(0).args[1];

      err.status.should.eql(502);
      this.ctx.status.should.eql(502);
      err.msg.should.eql('mega');
      err.request.should.eql(this.ctx.request);
      err.details.should.eql({ dummy: true });
      err.stack.should.be.defined;
    },


    'error page fail': function*() {
      let err = new errors.RuntimeError('mega', 502, {
        dummy: true,
      });

      let err2 = new Error('blah');

      this.ctx.render = this.mocker.spy(() => Q.reject(err2));

      let spy = this.mocker.spy();

      this.ctx.App.on('error', spy);

      yield middleware().call(this.ctx, function*() {
        throw err;
      });

      this.ctx.render.should.have.been.calledWith('error');

      spy.should.have.been.calledTwice;
      spy.getCall(0).args[0].should.eql(err.stack);      
      spy.getCall(1).args[0].should.eql(err2.stack);      
      spy.getCall(1).args[0].should.eql(this.ctx.body.stack);
      this.ctx.type.should.eql('json');
    },
  },
};
