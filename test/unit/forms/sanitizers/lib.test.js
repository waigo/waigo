

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigolet sanitizer = nulltest['lib'] = {
  beforeEach: function *() {
    yield this.initApp()sanitizer = waigo.load('support/forms/sanitizers/lib')},

  'invalid method': function *() {
    this.expect(() => {
      sanitizer({
        method: 'blahblah'
      })}).to.throw('Invalid method: blahblah')},

  'calls method': function *() {
    var fn = sanitizer({
      method: 'toBoolean',
    })this.expect(yield fn(null, 'true')).to.eql(true)},
}