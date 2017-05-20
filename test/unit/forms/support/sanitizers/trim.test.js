const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['trim'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.sanitizer = this.waigo.load('forms/support/sanitizers/trim')
  },

  'trims string': function *() {
    const fn = this.sanitizer()

    expect(yield fn(null, '  test ')).to.eql('test')
  },

  'leaves non string stuff alone': function *() {
    const fn = this.sanitizer()

    expect(yield fn(null, 12)).to.eql(12)
    expect(yield fn(null, null)).to.eql(null)
    expect(yield fn(null, undefined)).to.eql(undefined)
    expect(yield fn(null, true)).to.eql(true)
    expect(yield fn(null, [])).to.eql([])
    expect(yield fn(null, {})).to.eql({})
  }

}
