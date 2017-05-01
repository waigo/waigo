

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigolet validator = null,
  validationResult = undefinedtest['isEmailAddress'] = {
  beforeEach: function *() {
    this.spy = this.mocker.stub(require('validator'), 'isEmail', function () { 
      return validationResult})yield this.initApp()validator = waigo.load('support/forms/validators/isEmailAddress')},

  'calls through to validator module isEmail()': function *() {
    var fn = validator()try {
      yield fn(null, null, 'test')} catch (err) {
      /* nothing */
    } finally {
      this.spy.should.have.been.calledWithExactly('test')}
  },

  'fail': function *() {
    var fn = validator()validationResult = falseyield this.shouldThrow(fn(null, null, 'test'), 'Must be an email address')},

  'pass': function *() {
    var fn = validator()validationResult = trueyield fn(null, null, 'test')}

}