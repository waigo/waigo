

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo



test['password field'] = function *() {
  yield this.initApp()

  this.waigo.load('support/forms/fields/password').must.eql(
    this.waigo.load('support/forms/field').Field
  )
}
