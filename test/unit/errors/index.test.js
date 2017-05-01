const path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['errors'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.errors = this.waigo.load('errors')
    this.viewObjects = this.waigo.load('viewObjects')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'Error - view object': {
    'default': function *() {
      const err = new Error('test')

      const vo = yield this.viewObjects.toViewObjectYieldable(err)

      expect(vo).to.eql({
        type: 'Error',
        msg: 'test'
      })
    },

    'with stack': function *() {
      const err = new Error('test')

      const vo = yield this.viewObjects.toViewObjectYieldable(err, {
        App: {
          config: {
            errors: {
              showStack: true
            }
          }
        }
      })

      expect(vo).to.eql({
        type: 'Error',
        msg: 'test',
        stack: err.stack,
      })
    },

    'with details': function *() {
      const err = new Error('test'),
        err2 = new Error('test2')

      err.details = {
        err: err2
      }

      const vo = yield this.viewObjects.toViewObjectYieldable(err)

      expect(vo).to.eql({
        type: 'Error',
        msg: 'test',
        details: {
          err: yield this.viewObjects.toViewObjectYieldable(err2),
        },
      })
    },
  },

  'RuntimeError': {
    'defaults': function () {
      const e = new this.errors.RuntimeError()

      expect(e).to.be.instanceOf(Error)

      expect(e.message).to.eql('An error occurred')

      expect(e.name).to.eql('RuntimeError')

      expect(e.status).to.eql(500)
    },
    'with params': function () {
      const e = new this.errors.RuntimeError('my msg', 505, {
        blah: true
      })

      expect(e.message).to.eql('my msg')

      expect(e.name).to.eql('RuntimeError')

      expect(e.status).to.eql(505)

      expect(e.details).to.eql({ blah: true })
    },
    'view object': {
      'default': function *() {
        const e2 = new this.errors.RuntimeError('my msg', 501)

        const e = new this.errors.RuntimeError('my msg', 505, {
          blah: e2,
        })

        const viewObject = yield this.viewObjects.toViewObjectYieldable(e)

        expect(viewObject).to.eql({
          type: 'RuntimeError',
          msg: 'my msg',
          details: {
            blah: yield this.viewObjects.toViewObjectYieldable(e2)
          },
        })
      },

      'with stack': function *() {
        const e = new this.errors.RuntimeError('my msg', 505)

        const viewObject = yield this.viewObjects.toViewObjectYieldable(e, {
          App: {
            config: {
              errors: {
                showStack: true
              }
            }
          }
        })

        expect(viewObject).to.eql({
          type: 'RuntimeError',
          msg: 'my msg',
          stack: e.stack,
        })
      },
    },
  },

  'MultipleError': {
    'defaults': function () {
      const e = new this.errors.MultipleError()

      expect(e).to.be.instanceOf(this.errors.RuntimeError)

      expect(e.message).to.eql('Some errors occurred')

      expect(e.name).to.eql('MultipleError')

      expect(e.status).to.eql(500)

      expect(e.details).to.eql({})
    },
    'with params': function () {
      const multiError = {
        e1: new this.errors.RuntimeError()
      }

      const e = new this.errors.MultipleError('blah', 505, multiError)

      expect(e.message).to.eql('blah')

      expect(e.name).to.eql('MultipleError')

      expect(e.status).to.eql(505)

      expect(e.details).to.eql(multiError)
    },
    'view object': {
      default: function *() {
        const multiError = {
          e1: new this.errors.RuntimeError('test error 1', 403),
          e2: new Error('bad'),
          e3: new this.errors.RuntimeError()
        }

        const e = new this.errors.MultipleError('blah', 404, multiError)

        const viewObject = yield this.viewObjects.toViewObjectYieldable(e)

        expect(viewObject).to.eql({
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
        })
      },
      'with stack': function *() {
        const multiError = {
          e1: new this.errors.RuntimeError('test error 1', 403),
        }

        const e = new this.errors.MultipleError('blah', 404, multiError)

        const viewObject = yield this.viewObjects.toViewObjectYieldable(e, {
          App: {
            config: {
              errors: {
                showStack: true
              }
            }
          }
        })

        expect(viewObject).to.eql({
          type: 'MultipleError',
          msg: 'blah',
          details: {
            e1: {
              type: 'RuntimeError',
              msg: 'test error 1',
              stack: multiError.e1.stack,
            },
          },
          stack: e.stack,
        })
      },
    },
  },

  'define new error': {
    beforeEach: function () {
      this.RuntimeError2 = this.errors.define('RuntimeError2')

      this.MultipleError2 = this.errors.define('MultipleError2', this.errors.MultipleError)
    },

    'defaults - RuntimeError': function () {
      const e = new this.RuntimeError2()

      expect(e).to.be.instanceOf(this.errors.RuntimeError)

      expect(e.message).to.eql('An error occurred')

      expect(e.name).to.eql('RuntimeError2')

      expect(e.status).to.eql(500)
    },
    'defaults - MultipleError': function () {
      const e = new this.MultipleError2()

      expect(e).to.be.instanceOf(this.errors.MultipleError)

      expect(e.message).to.eql('Some errors occurred')

      expect(e.name).to.eql('MultipleError2')

      expect(e.status).to.eql(500)
    },
    'with params - RuntimeError': function () {
      const e = new this.RuntimeError2('my msg', 505)

      expect(e.message).to.eql('my msg')

      expect(e.name).to.eql('RuntimeError2')

      expect(e.status).to.eql(505)
    },
    'with params - MultipleError': function () {
      const multiError = {
        hello: new Error('blaze')
      }

      const e = new this.MultipleError2('my msg', 505, multiError)

      expect(e.message).to.eql('my msg')

      expect(e.name).to.eql('MultipleError2')

      expect(e.status).to.eql(505)

      expect(e.details).to.eql(multiError)
    },
    'view object - RuntimeError': function *() {
      const e = new this.RuntimeError2('my msg', 505)

      const eParent = new this.errors.RuntimeError('my msg', 505)

      const child = yield this.viewObjects.toViewObjectYieldable(e)

      const parent = yield this.viewObjects.toViewObjectYieldable(eParent)

      expect(child.type).to.eql('RuntimeError2')

      delete child.type
      delete parent.type

      expect(child).to.eql(parent)
    },
    'view object - MultipleError': function *() {
      const e = new this.MultipleError2('my msg', 505)

      const eParent = new this.errors.MultipleError('my msg', 505)

      const child = yield this.viewObjects.toViewObjectYieldable(e)

      const parent = yield this.viewObjects.toViewObjectYieldable(eParent)

      expect(child.type).to.eql('MultipleError2')

      delete child.type
      delete parent.type

      expect(child).to.eql(parent)
    },
  },

  'convert error to view object': {
    'Error with method to convert itself': function *() {
      const err = new Error('test')

      this.mocker.stub(err, this.viewObjects.METHOD_NAME, function () {
        return Q.resolve('blah')
      })

      const vo = yield this.viewObjects.toViewObjectYieldable(err)

      expect(vo).to.eql('blah')
    },
    'Error without method to convert itself': function *() {
      const err = new Error('test')

      delete err[this.viewObjects.METHOD_NAME]

      const vo = yield this.viewObjects.toViewObjectYieldable(err)

      expect(vo).to.eql({
        type: 'Error',
        msg: 'test'
      })
    },
  },
}
