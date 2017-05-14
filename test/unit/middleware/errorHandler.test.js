

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigovar middleware = null,
  errors = nulltest['context helpers'] = {
  beforeEach: function *() {
    middleware = nullthis._init = this.bind(function *() {
      yield this.initApp()yield this.startApp({
        startupSteps: ['db', 'models'],
        shutdownSteps: ['db'],
      })middleware = waigo.load('support/middleware/errorHandler')errors = waigo.load('support/errors')}, this)},

  afterEach: function *() {
    yield this.shutdownApp()},

  'throw()': {
    beforeEach: function *() {
      yield this._init()this.ctx = {
        App: this.App,
      }yield middleware().call(this.ctx, Q.resolve())},
    'default': function *() {
      try {
        this.ctx.throw('default error', 502)throw -1} catch (err) {
        err.must.be.instanceof(errors.RuntimeError)err.status.must.eql(502)err.message.must.eql('default error')}
    },
    'custom class': function *() {
      let MyError = errors.define('MyError')try {
        this.ctx.throw(MyError, 'default error', 502)throw -1} catch (err) {
        err.must.be.instanceof(MyError)err.status.must.eql(502)err.message.must.eql('default error')}
    },
  },

  'renders error page': {
    beforeEach: function *() {
      yield this._init()this.ctx = {
        App: this.App,
        request: {
          url: '/test',
          method: 'del',
        },
        render: this.mocker.spy(() => Q.resolve()),
      }},

    'error page ok': function *() {
      yield middleware().call(this.ctx, function *() {
        throw new errors.RuntimeError('mega', 502, {
          dummy: true,
        })})this.ctx.render.must.have.been.calledWith('error')let err = this.ctx.render.getCall(0).args[1]err.status.must.eql(502)this.ctx.status.must.eql(502)err.msg.must.eql('mega')err.request.must.eql(this.ctx.request)err.details.must.eql({ dummy: true })err.stack.must.be.defined},


    'error page fail': function *() {
      let err = new errors.RuntimeError('mega', 502, {
        dummy: true,
      })let err2 = new Error('blah')this.ctx.render = this.mocker.spy(() => Q.reject(err2))let spy = this.mocker.spy()this.ctx.App.on('error', spy)yield middleware().call(this.ctx, function *() {
        throw err})this.ctx.render.must.have.been.calledWith('error')spy.must.have.been.calledTwicespy.getCall(0).args[0].must.eql(err.stack)spy.getCall(1).args[0].must.eql(err2.stack)spy.getCall(1).args[0].must.eql(this.ctx.body.stack)this.ctx.type.must.eql('json')},
  },
}