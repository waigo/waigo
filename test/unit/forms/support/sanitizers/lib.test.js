const path = require('path')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['lib'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.sanitizer = this.waigo.load('forms/support/sanitizers/lib')
  },

  'invalid method': function *() {
    expect(() => {
      this.sanitizer({
        method: 'blahblah'
      })
    }).to.throw('Invalid method: blahblah')
  },

  'calls method': function *() {
    const fn = this.sanitizer({
      method: 'toBoolean',
    })

    expect(yield fn(null, 'true')).to.eql(true)
  },
}
