const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['compareToFielda'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.validator = this.waigo.load('forms/support/validators/compareToField')

    const form = this.waigo.load('forms/support/form')

    this.field = this.waigo.load('forms/support/field')

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'number'
        },
        {
          name: 'field2',
          type: 'number'
        },
      ]
    })

    this.field = this.form.fields.field2
  },

  'field not found': function *() {
    const fn = this.validator({
      field: 'blah'
    })

    yield this.awaitAsync(fn(null, this.field, 1)).must.reject.with.error(`Comparison field not found: blah`)
  },

  'gte': function *() {
    const fn = this.validator({
      field: 'field1',
      comparison: 'gte',
    })

    yield this.form.setValues({
      field1: 1,
    })

    yield this.awaitAsync(fn(null, this.field, 0)).must.reject.with.error('Must be greater than or equal to field1')
    yield fn(null, this.field, 1)
    yield fn(null, this.field, 2)
  },

  'lte': function *() {
    const fn = this.validator({
      field: 'field1',
      comparison: 'lte',
    })

    yield this.form.setValues({
      field1: 1,
    })

    yield this.awaitAsync(fn(null, this.field, 2)).must.reject.with.error('Must be less than or equal to field1')
    yield fn(null, this.field, 1)
    yield fn(null, this.field, 0)
  },

  'gt': function *() {
    const fn = this.validator({
      field: 'field1',
      comparison: 'gt',
    })

    yield this.form.setValues({
      field1: 1,
    })

    yield this.awaitAsync(fn(null, this.field, 0)).must.reject.with.error('Must be greater than field1')
    yield this.awaitAsync(fn(null, this.field, 1)).must.reject.with.error('Must be greater than field1')
    yield fn(null, this.field, 2)
  },

  'lt': function *() {
    const fn = this.validator({
      field: 'field1',
      comparison: 'lt',
    })

    yield this.form.setValues({
      field1: 1,
    })

    yield this.awaitAsync(fn(null, this.field, 2)).must.reject.with.error('Must be less than field1')
    yield this.awaitAsync(fn(null, this.field, 1)).must.reject.with.error('Must be less than field1')
    yield fn(null, this.field, 0)
  },

  'eq': function *() {
    const fn = this.validator({
      field: 'field1',
      comparison: 'eq',
    })

    yield this.form.setValues({
      field1: 1,
    })

    yield this.awaitAsync(fn(null, this.field, 0)).must.reject.with.error('Must be equal to field1')
    yield fn(null, this.field, 1)
    yield this.awaitAsync(fn(null, this.field, 2)).must.reject.with.error('Must be equal to field1')
  },

  'neq': function *() {
    const fn = this.validator({
      field: 'field1',
      comparison: 'neq',
    })

    yield this.form.setValues({
      field1: 1,
    })

    yield fn(null, this.field, 0)
    yield this.awaitAsync(fn(null, this.field, 1)).must.reject.with.error('Must not be equal to field1')
    yield fn(null, this.field, 2)
  },
}
