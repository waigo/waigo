

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo




test['email field'] = {
  beforeEach: function *() {
    yield this.initApp()

    const form = this.waigo.load('support/forms/form'),
      field = this.waigo.load('support/forms/field')

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'email'
        },
      ]
    })
  },

  'extends text field': function *() {
    const EmailField = this.waigo.load('support/forms/fields/email'),
      TextField = this.waigo.load('support/forms/fields/text')

    this.form.fields.field1.should.be.instanceof(EmailField)
    this.form.fields.field1.should.be.instanceof(TextField)
  },

  'auto-adds email validator': function *() {
    const field = this.form.fields.field1

    try {
      yield field.setSanitizedValue('test')
      yield field.validate()
      throw -1
    } catch (err) {
      expect(err.details).to.eql(['Must be an email address'])
    }
  },
}



