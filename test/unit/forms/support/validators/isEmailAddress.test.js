

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo


const validator = null,
  validationResult = undefined


test['isEmailAddress'] = {
  beforeEach: function *() {
    this.spy = this.mocker.stub(require('validator'), 'isEmail', function () { 
      return validationResult 
    })

    yield this.initApp()

    validator = this.waigo.load('support/forms/validators/isEmailAddress')
  },

  'calls through to validator module isEmail()': function *() {
    const fn = validator()

    try {
      yield fn(null, null, 'test')
    } catch (err) {
      /* nothing */
    } finally {
      this.spy.must..have.been.calledWithExactly('test')
    }
  },

  'fail': function *() {
    const fn = validator()
    validationResult = false

    yield this.must.Throw(fn(null, null, 'test'), 'Must be an email address')
  },

  'pass': function *() {
    const fn = validator()
    validationResult = true

    yield fn(null, null, 'test')
  }

}
