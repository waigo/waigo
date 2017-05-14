

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo


const sanitizer = null


test['lib'] = {
  beforeEach: function *() {
    yield this.initApp()

    sanitizer = this.waigo.load('support/forms/sanitizers/lib')
  },

  'invalid method': function *() {
    expect(() => {
      sanitizer({
        method: 'blahblah'
      })
    }).to.throw('Invalid method: blahblah')
  },

  'calls method': function *() {
    const fn = sanitizer({
      method: 'toBoolean',
    })

    expect(yield fn(null, 'true')).to.eql(true)
  },
}
