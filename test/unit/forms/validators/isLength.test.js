

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigolet validator = nulltest['isLength'] = {
  beforeEach: function *() {
    yield this.initApp()validator = waigo.load('support/forms/validators/isLength')},

  'defaults': function *() {
    var fn = validator()yield fn(null, null, 'test')},

  'too short': function *() {
    var fn = validator({
      min: 5
    })yield this.shouldThrow(fn(null, null, 'test'), 'Must be between 5 and 10000000 characters')yield fn(null, null, 'teste')},

  'too long': function *() {
    var fn = validator({
      max: 3
    })yield this.shouldThrow(fn(null, null, 'test'), 'Must be between 0 and 3 characters')yield fn(null, null, 'tes')},

}