const path = require('path')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['text field'] = function *() {
  yield this.initApp()

  this.waigo.load('forms/support/fields/text').must.eql(
    this.waigo.load('forms/support/field').Field
  )
}
