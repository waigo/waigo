const _ = require('lodash'),
  path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['listener'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })

    this.setup = this.waigo.load('listener/support/startup')

    this.App.koa.listen = this.mocker.stub().returns('abc')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },

  'starts HTTP listener': function *() {
    yield this.setup(this.App)

    expect(this.App.server).to.eql('abc')

    expect(this.App.koa.listen.calledOnce).to.be.true()
    expect(this.App.koa.listen.calledWithExactly(this.App.config.port)).to.be.true()
  },

  'notifies admins': function *() {
    const spy = this.mocker.spy()

    this.App.on('notify', spy)

    yield this.setup(this.App)

    expect(spy.calledOnce).to.be.true()
    spy.calledWith('admins').must.be.true()
    _.get(spy, 'args.0.1').must.contain('listening')
  },
}
