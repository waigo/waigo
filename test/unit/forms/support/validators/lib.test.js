const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['lib'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.validator = this.waigo.load('forms/support/validators/lib')
  },

  'invalid method': function *() {
    expect(() => {
      this.validator({
        method: 'blahblah'
      })
    }).to.throw('Invalid method: blahblah')
  },

  'calls method': function *() {
    const fn = this.validator({
      method: 'isLength',
      args: [3, 4],
    })

    yield this.mustThrow(fn(null, null, 'ab'), 'Validation failed: isLength')
    yield this.mustThrow(fn(null, null, 'abcde'), 'Validation failed: isLength')
    yield fn(null, null, 'abcd')
    yield fn(null, null, 'abc')
  },
}
