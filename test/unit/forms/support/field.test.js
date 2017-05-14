const path = require('path')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['form fields'] = {
  beforeEach: function *() {
    this.createAppModules({
      'forms/support/sanitizers/test': 'module.exports = function () { return function *(fo,fi,v) { return v } }',
      'forms/support/sanitizers/test_wo': 'module.exports = function (o) { return function *(fo,fi,v) { return [o, v] } }',
      'forms/support/validators/testv': 'module.exports = function () { return function *(fo,fi,v) { return v } }',
      'forms/support/validators/testv_wo': 'module.exports = function (o) { return function *(fo,fi,v) { return [o, v] } }'
    })

    yield this.initApp()

    this.formModule = this.waigo.load('forms/support/form')
    this.fieldModule = this.waigo.load('forms/support/field')
    this.errors = this.waigo.load('errors')

    const vo = this.waigo.load('viewObjects')
    this.viewObjectMethodName = vo.METHOD_NAME
    this.toViewObjectYieldable = vo.toViewObjectYieldable
  },

  'FieldValidationError': {
    'extends MultipleError': function () {
      const e = new this.fieldModule.FieldValidationError()
      e.must.be.instanceOf(this.errors.MultipleError)
    },
  },

  'FieldSanitizationError': {
    'extends RuntimeError': function () {
      const e = new this.fieldModule.FieldSanitizationError()
      e.must.be.instanceOf(this.errors.RuntimeError)
    }
  },

  'Field': {
    beforeEach: function *() {
      this.form = yield this.formModule.create({
        fields: [
          {
            name: 'test',
            type: 'text'
          }
        ]
      }, {
        test: {}
      })

      this.field = this.fieldModule.Field.new(this.form, {
        name: 'test',
        type: 'text',
      })
    },

    'construction': {
      'sets properties': function () {
        const f = this.fieldModule.Field.new(this.form, {
          type: 'text',
        })
        expect(f.form).to.eql(this.form)
        expect(f.config).to.eql({ type: 'text', })
        expect(f.sanitizers).to.eql([])
        expect(f.validators).to.eql([])
      },

      'initialises sanitizers': function *() {
        const f = this.fieldModule.Field.new(this.form, {
          type: 'text',
          sanitizers: ['test', { id: 'test_wo', option1: true }]
        })

        expect(f.sanitizers.length).to.eql(2)

        const fn1 = f.sanitizers[0].fn

        const fn2 = f.sanitizers[1].fn

        const results = yield [
          fn1(null, null, 256),
          fn2(null, null, 512)
        ]

        expect(results[0]).to.eql(256)
        expect(results[1]).to.eql([
          { option1: true },
          512
        ])
      },

      'initialises validators': function *() {
        const f = this.fieldModule.Field.new(this.form, {
          type: 'text',
          validators: ['testv', { id: 'testv_wo', option1: true }]
        })

        expect(f.validators.length).to.eql(2)

        const fn1 = f.validators[0].fn

        const fn2 = f.validators[1].fn

        const results = yield [
          fn1(null, null, 256),
          fn2(null, null, 512)
        ]

        expect(results[0]).to.eql(256)
        expect(results[1]).to.eql([
          { option1: true },
          512
        ])
      }
    },

    'get name': function () {
      const f = this.fieldModule.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })

      f.name.must.eql('test')
    },

    'get value': function () {
      const f = this.fieldModule.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })

      this.form.state.test = {
        value: 'blah'
      }

      f.value.must.eql('blah')
    },

    'set value': function () {
      const f = this.fieldModule.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })

      this.form.state.test = {
        value: 'blah'
      }

      f.value = 'ah'

      this.form.state.test.must.eql({
        value: 'ah'
      })
    },

    'get/set original value': function () {
      const f = this.fieldModule.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })

      f.originalValue = 'ah'
      f.originalValue.must.eql('ah')
    },

    'check if dirty': function () {
      const f = this.fieldModule.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })

      f.value = 'ah'

      f.isDirty().must.be.true()

      f.originalValue = 'ah'

      f.isDirty().must.be.false()

      f.value = 'blah'

      f.isDirty().must.be.true()
    },

    'set sanitized value': {
      'sanitization pass': function *() {
        const f = this.field

        f.sanitizers = [
          {
            fn: function *(field, v) {
              return v + '123'
            }
          }
        ]

        yield f.setSanitizedValue('abc')

        expect(f.value).to.eql('abc123')
      },

      'sanitization fail': function *() {
        const f = this.field

        f.sanitizers = [
          {
            fn: function *(field, v) {
              throw new Error('blah')
            }
          }
        ]

        try {
          yield f.setSanitizedValue('abc')
        } catch (err) {
          err.must.be.instanceOf(this.fieldModule.FieldSanitizationError)
          err.message.must.eql('blah')
        }
      },

      'sanitization fail - override msg': function *() {
        const f = this.field

        f.sanitizers = [
          {
            msg: 'holla',
            fn: function *(field, v) {
              throw new Error('blah')
            }
          }
        ]

        try {
          yield f.setSanitizedValue('abc')
        } catch (err) {
          err.must.be.instanceOf(this.fieldModule.FieldSanitizationError)
          err.message.must.eql('holla')
        }
      },
    },


    'validate': {
      'not required and not set': {
        'null': function *() {
          const f = this.field
          f.config.required = false
          f.value = null

          f.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                throw new Error('blah')
              }
            }
          ]

          yield f.validate()
        },
        'undefined': function *() {
          const f = this.field
          f.config.required = false
          f.value = undefined

          f.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                throw new Error('blah')
              }
            }
          ]

          yield f.validate()
        },
        'empty string': function *() {
          const f = this.field
          f.config.required = false
          f.value = ''

          f.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                throw new Error('blah')
              }
            }
          ]

          yield f.validate()
        },
      },
      'required and not set': {
        'null': function *() {
          const f = this.field
          f.config.required = true
          f.value = null

          f.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                if (undefined !== v) {
                  throw new Error('blah')
                }
              }
            }
          ]

          try {
            yield f.validate()
            throw new Error()
          } catch (err) {
            expect(err).to.be.instanceOf(this.fieldModule.FieldValidationError)
            expect(err.details).to.eql(['Must be set'])
          }
        },
        'undefined': function *() {
          const f = this.field
          f.config.required = true
          f.value = undefined

          f.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                if (undefined !== v) {
                  throw new Error('blah')
                }
              }
            }
          ]

          try {
            yield f.validate()
            throw new Error()
          } catch (err) {
            expect(err).to.be.instanceOf(this.fieldModule.FieldValidationError)
            expect(err.details).to.eql(['Must be set'])
          }
        },
        'empty string': function *() {
          const f = this.field
          f.config.required = true
          f.value = ''

          f.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                if (undefined !== v) {
                  throw new Error('blah')
                }
              }
            }
          ]

          try {
            yield f.validate()
            throw new Error()
          } catch (err) {
            expect(err).to.be.instanceOf(this.fieldModule.FieldValidationError)
            expect(err.details).to.eql(['Must be set'])
          }
        },
      },
      'pass': function *() {
        const f = this.field
        f.config.required = true
        f.value = 123

        f.validators = [
          {
            id: 'testv',
            fn: function *(field, v) {}
          }
        ]

        yield f.validate()
      },

      'fail': function *() {
        const f = this.field
        f.config.required = true
        f.value = 123

        f.validators = [
          {
            id: 'testv',
            fn: function *(field, v) {
              throw new Error('blah' + 123)
            }
          }
        ]

        try {
          yield f.validate()
          throw new Error()
        } catch (err) {
          expect(err).to.be.instanceOf(this.fieldModule.FieldValidationError)
          expect(err.details).to.eql(['blah123'])
        }
      },

      'override error message': function *() {
        const f = this.field
        f.config.required = true
        f.value = 123

        f.validators = [
          {
            id: 'testv',
            msg: 'hoola',
            fn: function *(field, v) {
              throw new Error('blah' + 123)
            }
          }
        ]

        try {
          yield f.validate()
          throw new Error()
        } catch (err) {
          expect(err).to.be.instanceOf(this.fieldModule.FieldValidationError)
          expect(err.details).to.eql(['hoola'])
        }
      },

    },

    'to view object': function *() {
      const f = this.field
      f.config.type = 'text'
      f.config.label = 'Name'
      f.config.helpText = 'bla bla bla'
      f.config.meta = {
        multiline: true,
        dummyKey: 1,
      }
      f.value = 87
      f.originalValue = 98

      const viewObject = yield this.toViewObjectYieldable(f)

      expect(viewObject).to.eql({
        type: 'text',
        name: 'test',
        label: 'Name',
        helpText: 'bla bla bla',
        meta: {
          multiline: true,
          dummyKey: 1,
        },
        value: 87,
        originalValue: 98
      })
    }
  },

  'create new Field': {
    'loads field class and constructs and instance': function *() {
      const newForm = yield this.formModule.create({
        fields: [{
          name: 'blah2',
          type: 'text'
        }]
      })
      const f = this.fieldModule.Field.new(newForm, {
        name: 'blah',
        type: 'text'
      })

      f.must.be.instanceOf(this.fieldModule.Field)
      f.must.be.instanceOf(this.waigo.load('forms/support/fields/text'))

      expect(f.config).to.eql({
        name: 'blah',
        type: 'text'
      })
    }
  }

}
