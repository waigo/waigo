const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['csrf'] = {
  beforeEach: function *() {
    yield this.initApp()

    const form = this.waigo.load('forms/support/form')

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'csrf',
        },
      ]
    })

    this.field = this.form.fields.field1
  },

  'extends text field': function *() {
    const CsrfField = this.waigo.load('forms/support/fields/csrf'),
      HiddenField = this.waigo.load('forms/support/fields/hidden')

    this.field.must.be.instanceof(CsrfField)
    this.field.must.be.instanceof(HiddenField)
  },

  'view object': function *() {
    const toViewObjectYieldable = this.waigo.load('viewObjects').toViewObjectYieldable

    yield this.field.setSanitizedValue('test')

    const vo = yield toViewObjectYieldable(this.field, {
      csrf: 'blah',
    })

    vo.value.must.eql('blah')
  },

  'validate': {
    beforeEach: function *() {
      yield this.field.setSanitizedValue(1)

      this.csrfPass = false

      this.ctx = {
        assertCSRF: (val) => {
          if (!this.csrfPass) {
            throw new Error('bad csrf')
          }
        },
      }
    },
    'fail': function *() {
      this.csrfPass = false

      try {
        yield this.field.validate()
        throw new Error()
      } catch (err) {
        expect(err.details).to.eql(['CSRF token check failed'])
      }
    },
    'pass': function *() {
      this.csrfPass = true

      yield this.field.validate(this.ctx)
    },
  },
}
