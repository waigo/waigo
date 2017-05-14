

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo


const validator = null,
  validationResult = undefined


test['lib'] = {
  beforeEach: function *() {
    yield this.initApp()

    validator = this.waigo.load('support/forms/validators/lib')
  },

  'invalid method': function *() {
    expect(() => {
      validator({
        method: 'blahblah'
      })
    }).to.throw('Invalid method: blahblah')
  },

  'calls method': function *() {
    const fn = validator({
      method: 'isLength',
      args: [3, 4],
    })

    yield this.shouldThrow(fn(null, null, 'ab'), 'Validation failed: isLength')
    yield this.shouldThrow(fn(null, null, 'abcde'), 'Validation failed: isLength')
    yield fn(null, null, 'abcd')
    yield fn(null, null, 'abc')
  },
}
