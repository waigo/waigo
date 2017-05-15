const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['hidden'] = {
  beforeEach: function *() {
    yield this.initApp()

    const form = this.waigo.load('forms/support/form')

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'hidden',
        },
      ]
    })

    this.field = this.form.fields.field1
  },

  'extends text field': function *() {
    const HiddenField = this.waigo.load('forms/support/fields/hidden'),
      Field = this.waigo.load('forms/support/fields/text')

    this.field.must.be.instanceof(HiddenField)
    this.field.must.be.instanceof(Field)
  },

  'view object': function *() {
    const toViewObjectYieldable = this.waigo.load('viewObjects').toViewObjectYieldable

    const vo = yield toViewObjectYieldable(this.field)

    vo.type.must.eql('hidden')
  },
}
