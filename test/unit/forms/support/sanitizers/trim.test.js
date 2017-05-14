

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo


const sanitizer = null


test['trim'] = {
  beforeEach: function *() {
    yield this.initApp()

    sanitizer = this.waigo.load('support/forms/sanitizers/trim')
  },

  'trims string': function *() {
    const fn = sanitizer()

    expect(yield fn(null, '  test ')).to.eql('test')
  },

  'leaves non string stuff alone': function *() {
    const fn = sanitizer()

    expect(yield fn(null, 12)).to.eql(12)
    expect(yield fn(null, null)).to.eql(null)
    expect(yield fn(null, undefined)).to.eql(undefined)
    expect(yield fn(null, true)).to.eql(true)
    expect(yield fn(null, [])).to.eql([])
    expect(yield fn(null, {})).to.eql({})
  }

}
