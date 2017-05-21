const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['sessions'] = {
  beforeEach: function *() {
    this.createAppModules({
      'sessions/testStore': 'module.exports = { create: function (app, cfg) { return cfg } }'
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.middleware = this.waigo.load('middleware/sessions')
    this.ctx = {
      request: {},
      query: {},
    }
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'verifies that cookie signing keys are set': function *() {
    const options = {
      App: this.App,
      name: 'sessionName',
      store: {
        type: 'testStore',
        config: {
          hello: 'world'
        }
      },
      cookie: {
        validForDays: 3,
        path: '/blah'
      }
    }

    expect(() => {
      this.middleware(this.App, options)
    }).to.throw('Please specify cookie signing keys in the config file')
  },
  'default': function *() {
    const createStoreSpy = this.mocker.spy(
      this.waigo.load('sessions/testStore'),
      'create'
    )

    const options = {
      App: this.App,
      keys: ['my', 'key'],
      name: 'sessionName',
      store: {
        type: 'testStore',
        config: {
          hello: 'world'
        }
      },
      cookie: {
        validForDays: 3,
        path: '/blah'
      }
    }

    this.middleware(this.App, options)

    this.App.koa.keys.must.eql(['my', 'key'])
    createStoreSpy.calledOnce.must.be.true()
    createStoreSpy.calledWithExactly(this.App, {hello: 'world'}).must.be.true()
  }
}
