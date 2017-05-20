const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['password field'] = function *() {
  yield this.initApp()

  this.waigo.load('forms/support/fields/password').must.eql(
    this.waigo.load('forms/support/field').Field
  )
}
