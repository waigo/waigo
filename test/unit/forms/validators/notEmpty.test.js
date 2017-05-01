

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigolet validator = nulltest['notEmpty'] = {
  beforeEach: function *() {
    yield this.initApp()validator = waigo.load('support/forms/validators/notEmpty')},

  'null': function *() {
    var fn = validator()yield this.shouldThrow(fn(null, null, null), 'Must not be empty')},
  'undefined': function *() {
    var fn = validator()yield this.shouldThrow(fn(null, null, undefined), 'Must not be empty')},
  'empty string': function *() {
    var fn = validator()yield this.shouldThrow(fn(null, null, ''), 'Must not be empty')},
  'non-empty string': function *() {
    var fn = validator()yield fn(null, null, 'a')},
  'number': function *() {
    var fn = validator()yield fn(null, null, 0)},
  'boolean: true': function *() {
    var fn = validator()yield fn(null, null, true)},
  'boolean: false': function *() {
    var fn = validator()yield fn(null, null, false)}
}