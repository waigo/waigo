const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['email field'] = {
  beforeEach: function *() {
    yield this.initApp()

    const form = this.waigo.load('forms/support/form')

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
    const EmailField = this.waigo.load('forms/support/fields/email'),
      TextField = this.waigo.load('forms/support/fields/text')

    this.form.fields.field1.must.be.instanceof(EmailField)
    this.form.fields.field1.must.be.instanceof(TextField)
  },

  'auto-adds email validator': function *() {
    const field = this.form.fields.field1

    try {
      yield field.setSanitizedValue('test')
      yield field.validate()
      throw new Error()
    } catch (err) {
      expect(err.details).to.eql(['Must be an email address'])
    }
  },
}
