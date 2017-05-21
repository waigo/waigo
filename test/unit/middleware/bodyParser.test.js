const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['body parser'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.bodyParser = this.waigo.load('middleware/bodyParser')
  },

  'uses co-body': function *() {
    expect(this.bodyParser._bodyParser).to.eql(require('co-body'))
  },

  'parses the body': function *() {
    const ctx = {
      request: {}
    }

    this.bodyParser._bodyParser = this.mocker.stub().returns({
      dummy: true
    })

    const next = function *() {
      ctx.nextCalled = 1
    }

    yield this.bodyParser().call(ctx, next)

    expect(ctx.request.body).to.eql({
      dummy: true
    })

    expect(ctx.nextCalled).to.eql(1)
  }
}
