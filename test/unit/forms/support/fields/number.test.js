const path = require('path')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['number'] = {
  beforeEach: function *() {
    yield this.initApp()

    const form = this.waigo.load('forms/support/form')

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'number',
        },
      ]
    })

    this.field = this.form.fields.field1
  },

  'extends text field': function *() {
    const NumberField = this.waigo.load('forms/support/fields/number'),
      TextField = this.waigo.load('forms/support/fields/text')

    this.field.must.be.instanceof(NumberField)
    this.field.must.be.instanceof(TextField)
  },

  'view object': function *() {
    const toViewObjectYieldable = this.waigo.load('viewObjects').toViewObjectYieldable

    const vo = yield toViewObjectYieldable(this.field)

    vo.type.must.eql('number')
  },

  'sanitize': {
    'number': function *() {
      yield this.field.setSanitizedValue(23)

      this.field.value.must.eql(23)
    },
    'string': function *() {
      yield this.field.setSanitizedValue('23')

      this.field.value.must.eql(23)
    },
    'empty string': function *() {
      yield this.field.setSanitizedValue('')

      this.field.value.must.eql(0)
    },
    'boolean': function *() {
      yield this.field.setSanitizedValue(true)

      this.field.value.must.eql(1)
    },
    'null': function *() {
      yield this.field.setSanitizedValue(null)

      this.field.value.must.eql(0)
    },
    'undefined': function *() {
      yield this.field.setSanitizedValue(undefined)

      this.field.value.must.eql(NaN)
    },
  },
}
