const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['db wrapper'] = {
  beforeEach: function *() {
    this.createAppModules({
      'db/type1/models/model1': `
        exports.schema = 7;
      `,
      'db/type1/models/model2': `
        exports.schema = 8;
      `,
      'db/type1/adapter': `
        const adapter = exports.adapter = {}

        exports.connect = function *(cfg) {
          adapter.cfg = cfg

          return 123
        }

        exports.disconnect = function *(c) {
          adapter.disconnected = c
        }

        exports.model = function *(db, name, spec) {
          return [db, name, spec]
        }
      `,
      'db/type2/adapter': `
        const adapter = exports.adapter = {}

        exports.connect = function *(cfg) {
          adapter.cfg = cfg

          return 456
        }

        exports.disconnect = function *(c) {
          adapter.disconnected = c
        }

        exports.model = function *(db, name, spec) {
          return [db, name, spec]
        }
      `,
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.Wrapper = this.waigo.load('db/support/wrapper')
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'create connection': function *() {
    const inst = new this.Wrapper(
      this.App, 'test', this.App.logger, 'type1', {
        dummy: true
      }
    )

    yield inst.init()

    inst.db.must.eql(123)
    inst.builder.adapter.cfg.must.eql({ dummy: true })
  },
  'destroy connection': function *() {
    const inst = new this.Wrapper(
      this.App, 'test', this.App.logger, 'type2', {
        dummy: true
      }
    )

    yield inst.init()

    inst.db.must.eql(456)

    yield inst.destroy()

    inst.builder.adapter.disconnected.must.eql(456)
  },

  models: {
    'model not found': function *() {
      const inst = new this.Wrapper(
        this.App, 'test', this.App.logger, 'type1', {
          dummy: true
        }
      )

      yield inst.init()

      yield this.mustThrow(inst.model('unknown'), 'File not found: db/type1/models/unknown')
    },
    'loads model': function *() {
      const inst = new this.Wrapper(
        this.App, 'test', this.App.logger, 'type1', {
          dummy: true
        }
      )

      yield inst.init()

      const model = yield inst.model('Model1', {
        table: 'abc'
      })

      model.must.eql([
        123,
        'Model1',
        {
          schema: 7,
          table: 'abc'
        }
      ])
    },
  }
}
