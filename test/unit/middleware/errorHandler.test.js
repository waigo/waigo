const path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['context helpers'] = {
  beforeEach: function *() {
    this.middleware = null

    this._init = this.bind(function *() {
      yield this.initApp()

      yield this.startApp({
        startupSteps: ['db'],
        shutdownSteps: ['db'],
      })

      this.middleware = this.waigo.load('middleware/errorHandler')
      this.errors = this.waigo.load('errors')
    }, this)
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'throw()': {
    beforeEach: function *() {
      yield this._init()

      this.ctx = {
        App: this.App,
      }

      yield this.middleware().call(this.ctx, Q.resolve())
    },
    'default': function *() {
      try {
        this.ctx.throw('default error', 502)
        throw new Error()
      } catch (err) {
        err.must.be.instanceof(this.errors.RuntimeError)
        err.status.must.eql(502)
        err.message.must.eql('default error')
      }
    },
    'custom class': function *() {
      const MyError = this.errors.define('MyError')

      try {
        this.ctx.throw(MyError, 'default error', 502)
        throw new Error()
      } catch (err) {
        err.must.be.instanceof(MyError)
        err.status.must.eql(502)
        err.message.must.eql('default error')
      }
    },
  },

  'renders error page': {
    beforeEach: function *() {
      yield this._init()

      this.ctx = {
        App: this.App,
        request: {
          url: '/test',
          method: 'del',
        },
        render: this.mocker.spy(() => Q.resolve()),
      }
    },

    'error page ok': function *() {
      yield this.middleware().call(this.ctx, function *() {
        throw new this.errors.RuntimeError('mega', 502, {
          dummy: true,
        })
      })

      this.ctx.render.calledWith('error').must.be.true()
      const err = this.ctx.render.getCall(0).args[1]

      err.status.must.eql(502)
      this.ctx.status.must.eql(502)
      err.msg.must.eql('mega')
      err.request.must.eql(this.ctx.request)
      err.details.must.eql({ dummy: true })
      err.stack.must.exist()
    },


    'error page fail': function *() {
      const err = new this.errors.RuntimeError('mega', 502, {
        dummy: true,
      })

      const err2 = new Error('blah')

      this.ctx.render = this.mocker.spy(() => Q.reject(err2))

      const spy = this.mocker.spy()

      this.ctx.App.on('error', spy)

      yield this.middleware().call(this.ctx, function *() {
        throw err
      })

      this.ctx.render.calledWith('error').must.be.true()

      spy.calledTwice.must.be.true()
      spy.getCall(0).args[0].must.eql(err.stack)
      spy.getCall(1).args[0].must.eql(err2.stack)
      spy.getCall(1).args[0].must.eql(this.ctx.body.stack)
      this.ctx.type.must.eql('json')
    },
  },
}
