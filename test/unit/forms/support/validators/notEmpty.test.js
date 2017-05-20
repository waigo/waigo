const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['notEmpty'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.validator = this.waigo.load('forms/support/validators/notEmpty')
  },

  'null': function *() {
    const fn = this.validator()

    yield this.awaitAsync(fn(null, null, null)).must.reject.with.error('Must not be empty')
  },
  'undefined': function *() {
    const fn = this.validator()

    yield this.awaitAsync(fn(null, null, undefined)).must.reject.with.error('Must not be empty')
  },
  'empty string': function *() {
    const fn = this.validator()

    yield this.awaitAsync(fn(null, null, '')).must.reject.with.error('Must not be empty')
  },
  'non-empty string': function *() {
    const fn = this.validator()

    yield fn(null, null, 'a')
  },
  'number': function *() {
    const fn = this.validator()

    yield fn(null, null, 0)
  },
  'boolean: true': function *() {
    const fn = this.validator()

    yield fn(null, null, true)
  },
  'boolean: false': function *() {
    const fn = this.validator()

    yield fn(null, null, false)
  }
}
