const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['isLength'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.validator = this.waigo.load('forms/support/validators/isLength')
  },

  'defaults': function *() {
    const fn = this.validator()

    yield fn(null, null, 'test')
  },

  'too short': function *() {
    const fn = this.validator({
      min: 5
    })

    yield this.mustThrow(fn(null, null, 'test'), 'Must be between 5 and 10000000 characters in length')
    yield fn(null, null, 'teste')
  },

  'too long': function *() {
    const fn = this.validator({
      max: 3
    })

    yield this.mustThrow(fn(null, null, 'test'), 'Must be between 0 and 3 characters in length')
    yield fn(null, null, 'tes')
  },

}
