const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['db startup'] = {
  beforeEach: function *() {
    this.createAppModules({
      'db/support/wrapper': `
        class MockWrapper {
          constructor (App, id, logger, type, cfg) {
            this.App = App
            this.id = id
            this.logger = logger
            this.type = type
            this.cfg = cfg
          }

          *init () {
            this.initialized = true
          }
        }

        module.exports = MockWrapper
      `,
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.setup = this.waigo.load('db/support/startup')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'cfg not found': function *() {
    this.App.config.db = {
      test: {},
      test2: null,
      test3: {}
    }

    this.awaitAsync(this.setup(this.App)).must.reject.with.error('Unable to find configuration for database: test')
  },
  'all initialized': function *() {
    this.App.config.db = {
      test: {
        dummy: 1,
        type: 't1'
      },
      test2: {
        dummy: 2,
        type: 't2'
      },
      test3: {
        dummy: 3,
        type: 't3'
      }
    }

    yield this.setup(this.App)

    expect(this.App.dbs.test).to.exist()
    this.App.dbs.test.initialized.must.be.true()
    this.App.dbs.test.App.must.eql(this.App)
    this.App.dbs.test.id.must.eql('test')
    this.App.dbs.test.type.must.eql('t1')
    this.App.dbs.test.cfg.must.eql(this.App.config.db.test)
    this.App.dbs.test.logger.must.exist()

    expect(this.App.dbs.test2).to.exist()
    this.App.dbs.test2.initialized.must.be.true()
    this.App.dbs.test2.App.must.eql(this.App)
    this.App.dbs.test2.id.must.eql('test2')
    this.App.dbs.test2.type.must.eql('t2')
    this.App.dbs.test2.cfg.must.eql(this.App.config.db.test2)
    this.App.dbs.test2.logger.must.exist()

    expect(this.App.dbs.test3).to.exist()
    this.App.dbs.test3.initialized.must.be.true()
    this.App.dbs.test3.App.must.eql(this.App)
    this.App.dbs.test3.id.must.eql('test3')
    this.App.dbs.test3.type.must.eql('t3')
    this.App.dbs.test3.cfg.must.eql(this.App.config.db.test3)
    this.App.dbs.test3.logger.must.exist()
  },
  'main db set': function *() {
    this.App.config.db = {
      main: {
        dummy: 1,
        type: 't1'
      },
      test2: {
        dummy: 2,
        type: 't2'
      },
    }

    yield this.setup(this.App)

    expect(this.App.db).to.eql(this.App.dbs.main)
  },
}
