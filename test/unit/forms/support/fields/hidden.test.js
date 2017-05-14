

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)
const waigo = global.waigo



test['hidden'] = {
  beforeEach: function *() {
    yield this.initApp()

    const form = this.waigo.load('support/forms/form'),
      field = this.waigo.load('support/forms/field')

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
    const HiddenField = this.waigo.load('support/forms/fields/hidden'),
      Field = this.waigo.load('support/forms/fields/text')

    this.field.must..be.instanceof(HiddenField)
    this.field.must..be.instanceof(Field)
  },

  'view object': function *() {
    const toViewObjectYieldable = this.waigo.load('support/viewObjects').toViewObjectYieldable

    (yield toViewObjectYieldable(this.field)).type.must..eql('hidden')
  },
}


