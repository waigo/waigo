

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo


const validator = null


test['notEmpty'] = {
  beforeEach: function *() {
    yield this.initApp()

    validator = this.waigo.load('forms/support/validators/notEmpty')
  },

  'null': function *() {
    const fn = validator()

    yield this.must.Throw(fn(null, null, null), 'Must not be empty')
  },
  'undefined': function *() {
    const fn = validator()

    yield this.must.Throw(fn(null, null, undefined), 'Must not be empty')
  },
  'empty string': function *() {
    const fn = validator()

    yield this.must.Throw(fn(null, null, ''), 'Must not be empty')
  },
  'non-empty string': function *() {
    const fn = validator()

    yield fn(null, null, 'a')
  },
  'number': function *() {
    const fn = validator()

    yield fn(null, null, 0)
  },
  'boolean: true': function *() {
    const fn = validator()

    yield fn(null, null, true)
  },
  'boolean: false': function *() {
    const fn = validator()

    yield fn(null, null, false)
  }
}
