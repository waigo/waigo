

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['email field'] = {
  beforeEach: function *() {
    yield this.initApp()let form = waigo.load('support/forms/form'),
      field = waigo.load('support/forms/field')this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'email'
        },
      ]
    })},

  'extends text field': function *() {
    let EmailField = waigo.load('support/forms/fields/email'),
      TextField = waigo.load('support/forms/fields/text')this.form.fields.field1.should.be.instanceof(EmailField)this.form.fields.field1.should.be.instanceof(TextField)},

  'auto-adds email validator': function *() {
    let field = this.form.fields.field1try {
      yield field.setSanitizedValue('test')yield field.validate()throw -1} catch (err) {
      this.expect(err.details).to.eql(['Must be an email address'])}
  },
}