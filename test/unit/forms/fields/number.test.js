

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['number'] = {
  beforeEach: function *() {
    yield this.initApp()let form = waigo.load('support/forms/form'),
      field = waigo.load('support/forms/field')this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'number',
        },
      ]
    })this.field = this.form.fields.field1},

  'extends text field': function *() {
    let NumberField = waigo.load('support/forms/fields/number'),
      TextField = waigo.load('support/forms/fields/text')this.field.should.be.instanceof(NumberField)this.field.should.be.instanceof(TextField)},

  'view object': function *() {
    let toViewObjectYieldable = waigo.load('support/viewObjects').toViewObjectYieldable(yield toViewObjectYieldable(this.field)).type.should.eql('number')},

  'sanitize': {
    'number': function *() {
      yield this.field.setSanitizedValue(23)this.field.value.should.eql(23)},
    'string': function *() {
      yield this.field.setSanitizedValue('23')this.field.value.should.eql(23)},
    'empty string': function *() {
      yield this.field.setSanitizedValue('')this.field.value.should.eql(0)},
    'boolean': function *() {
      yield this.field.setSanitizedValue(true)this.field.value.should.eql(1)},
    'null': function *() {
      yield this.field.setSanitizedValue(null)this.field.value.should.eql(0)},
    'undefined': function *() {
      yield this.field.setSanitizedValue(undefined)this.field.value.should.eql(NaN)},
  },
}