const path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['promise'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.promise = this.waigo.load('promise')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'same as bluebird': function *() {
    expect(this.promise).to.eql(Q)
  },

  'promisify': {
    beforeEach: function *() {
      this.retVal = null
      this.retErr = null

      this.spy = this.mocker.spy((a, cb) => {
        cb(this.retErr, this.retVal)
      })

      this.fn = this.promise.promisify(this.spy)
    },
    'fail': function *() {
      this.retErr = new Error('test error')

      yield this.mustThrow(this.fn(2), 'test error')

      this.spy.calledWith(2).must.be.true()
    },
    'pass': function *() {
      this.retVal = 234

      yield this.awaitAsync(this.fn(2)).must.resolve.to.eql(234)

      this.spy.calledWith(2).must.be.true()
    },
  }
}
