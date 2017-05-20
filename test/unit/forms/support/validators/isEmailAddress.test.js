const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['isEmailAddress'] = {
  beforeEach: function *() {
    this.spy = this.mocker.stub(require('validator'), 'isEmail', () => {
      return this.validationResult
    })

    yield this.initApp()

    this.validator = this.waigo.load('forms/support/validators/isEmailAddress')
  },

  'calls through to validator module isEmail()': function *() {
    const fn = this.validator()

    try {
      yield fn(null, null, 'test')
    } catch (err) {
      /* nothing */
    } finally {
      expect(this.spy.calledWithExactly('test')).to.be.true()
    }
  },

  'fail': function *() {
    const fn = this.validator()
    this.validationResult = false

    yield this.awaitAsync(fn(null, null, 'test')).must.reject.with.error('Must be an email address')
  },

  'pass': function *() {
    const fn = this.validator()
    this.validationResult = true

    yield this.awaitAsync(fn(null, null, 'test')).must.resolve.to.eql()
  }

}
