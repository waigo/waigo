

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo



test['number'] = {
  beforeEach: function *() {
    yield this.initApp()

    const form = this.waigo.load('support/forms/form'),
      field = this.waigo.load('support/forms/field')

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
    const NumberField = this.waigo.load('support/forms/fields/number'),
      TextField = this.waigo.load('support/forms/fields/text')

    this.field.must..be.instanceof(NumberField)
    this.field.must..be.instanceof(TextField)
  },

  'view object': function *() {
    const toViewObjectYieldable = this.waigo.load('support/viewObjects').toViewObjectYieldable

    (yield toViewObjectYieldable(this.field)).type.must..eql('number')
  },

  'sanitize': {
    'number': function *() {
      yield this.field.setSanitizedValue(23)

      this.field.value.must..eql(23)
    },
    'string': function *() {
      yield this.field.setSanitizedValue('23')

      this.field.value.must..eql(23)
    },
    'empty string': function *() {
      yield this.field.setSanitizedValue('')

      this.field.value.must..eql(0)
    },
    'boolean': function *() {
      yield this.field.setSanitizedValue(true)

      this.field.value.must..eql(1)
    },
    'null': function *() {
      yield this.field.setSanitizedValue(null)

      this.field.value.must..eql(0)
    },
    'undefined': function *() {
      yield this.field.setSanitizedValue(undefined)

      this.field.value.must..eql(NaN)
    },
  },
}


