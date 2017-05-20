const path = require('path'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['select'] = {
  beforeEach: function *() {
    yield this.initApp()

    const form = this.waigo.load('forms/support/form')

    this.form = yield form.create({
      fields: [
        {
          name: 'field1',
          type: 'select',
          options: {
            key1: 'label1',
            key2: 'label2',
          },
        },
      ]
    })

    this.field = this.form.fields.field1
  },

  'extends field': function *() {
    const SelectField = this.waigo.load('forms/support/fields/select'),
      Field = this.waigo.load('forms/support/field').Field

    this.field.must.be.instanceof(SelectField)
    this.field.must.be.instanceof(Field)
  },

  'has options': {
    'object': function *() {
      this.field.config.options = {
        key1: 'label1',
        key2: 'label2',
      }

      const options = yield this.field.getOptions()

      options.must.eql({
        key1: 'label1',
        key2: 'label2',
      })
    },
    'function': function *() {
      this.field.config.options = function *() {
        return 234
      }

      const opts = yield this.field.getOptions()

      opts.must.eql(234)
    },
  },

  'view object': function *() {
    const toViewObjectYieldable = this.waigo.load('viewObjects').toViewObjectYieldable

    this.mocker.stub(this.field, 'getOptions').returns(Q.resolve(123))

    const vo = yield toViewObjectYieldable(this.field)

    vo.options.must.eql(123)
  },

  'validate': {
    'single-select': {
      'pass': function *() {
        yield this.field.setSanitizedValue('key1')

        yield this.field.validate()
      },
      'fail - invalid': function *() {
        yield this.field.setSanitizedValue('key3')

        try {
          yield this.field.validate()
          throw new Error()
        } catch (err) {
          expect(err.details).to.eql(['Must be one of: label1, label2'])
        }
      },
      'fail - multi': function *() {
        yield this.field.setSanitizedValue(['key1', 'key2'])

        try {
          yield this.field.validate()
          throw new Error()
        } catch (err) {
          expect(err.details).to.eql(['Must be one of: label1, label2'])
        }
      },
    },
    'multi-select': {
      beforeEach: function *() {
        this.field.config.multiple = true
      },
      'pass - single': function *() {
        yield this.field.setSanitizedValue('key1')

        yield this.field.validate()
      },
      'pass - multi': function *() {
        yield this.field.setSanitizedValue(['key1', 'key2'])

        yield this.field.validate()
      },
      'fail - invalid': function *() {
        yield this.field.setSanitizedValue(['key1', 'key3'])

        try {
          yield this.field.validate()
          throw new Error()
        } catch (err) {
          expect(err.details).to.eql(['Must be one or more of: label1, label2'])
        }
      },
    },
  },
}
