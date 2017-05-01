

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['password field'] = function *() {
  yield this.initApp()waigo.load('support/forms/fields/password').should.eql(
    waigo.load('support/forms/field').Field
  )}