const _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['forms'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.formModule = this.waigo.load('forms/support/form')
    this.field = this.waigo.load('forms/support/field')
    this.errors = this.waigo.load('errors')

    const vo = this.waigo.load('viewObjects')
    this.viewObjectMethodName = vo.METHOD_NAME
    this.toViewObjectYieldable = vo.toViewObjectYieldable
  },

  'FormValidationError': {
    'extends MultipleError': function *() {
      const e = new this.formModule.FormValidationError()

      e.must.be.instanceOf(this.errors.MultipleError)
    },
    'default toViewObject': function *() {
      const e = new this.formModule.FormValidationError('test', 400, {
        field1: {
          val1: 'blah1',
          val2: 'blah2',
        },
        field2: {
          val1: 'blah3',
          val2: 'blah4',
        },
      })

      const actualViewObject = yield this.toViewObjectYieldable(e)

      const me = new this.errors.MultipleError('test', 400, e.details)

      const expectedViewObject = yield this.toViewObjectYieldable(me)

      expectedViewObject.type = 'FormValidationError'

      expect(actualViewObject).to.eql(expectedViewObject)
    },
  },

  'Form': {
    'beforeEach': function *() {
      this.newFieldSpy = this.mocker.stub(this.field.Field, 'new', function (form, def) {
        return {
          name: def.name + ' created'
        }
      })

      this.formConfig = {
        fields: [
          {
            name: 'email',
            type: 'text'
          },
          {
            name: 'age',
            type: 'number'
          },
        ]
      }

      this.form = yield this.formModule.create(this.formConfig)
    },

    'construction': {
      'initialises state': function *() {
        const f = yield this.formModule.create(this.formConfig)

        expect(f.state).to.eql({
          email: {
            value: undefined
          },
          age: {
            value: undefined
          }
        })
      },

      'initialises config': function *() {
        const f = yield this.formModule.create(this.formConfig)

        expect(f.config).to.eql(this.formConfig)
      },

      'initialises fields': function *() {
        const f = this.form

        expect(f._fields).to.eql({
          email: {name: 'email created'},
          age: {name: 'age created'}
        })

        expect(this.newFieldSpy.calledTwice).to.be.true()
        expect(this.newFieldSpy.calledWithExactly(f, f.config.fields[0])).to.be.true()
        expect(this.newFieldSpy.calledWithExactly(f, f.config.fields[1])).to.be.true()
      },

      'can re-use stuff from existing Form': function *() {
        this.form.state = {
          email: 'test',
          age: 12
        }

        const f = yield this.formModule.create(this.form)

        expect(f.config).to.eql(this.form.config)
        expect(f._fields).to.eql(this.form.fields)

        expect(f.state).to.eql(this.form.state)
      },

      'but can pass in state to override state from existing Form': function *() {
        this.form.state = {
          email: 'test',
          age: 12
        }

        const f = yield this.formModule.create(this.form, {
          state: {
            email: 'blah',
            age: 23
          },
        })

        expect(f.config).to.eql(this.form.config)
        expect(f._fields).to.eql(this.form.fields)

        expect(f.state).to.eql({
          email: 'blah',
          age: 23
        })
      }
    },

    'get fields': function *() {
      const f = this.form
      f._fields = 'test'
      expect(f.fields).to.eql('test')
    },

    'get state': function *() {
      const f = this.form
      f._state = 'test'
      expect(f.state).to.eql('test')
    },

    'set state': function *() {
      const f = this.form

      const state = {
        email: {
          value: 123
        },
        test: {
          value: false
        }
      }

      f.state = state

      expect(f.state).to.eql({
        email: {
          value: 123
        },
        test: {
          value: false
        },
        age: {
          value: undefined
        }
      })
    },

    'set field values': function *() {
      const f = this.form

      const values = {}
      _.each(f.fields, function (field, name) {
        field.setSanitizedValue = function *(v) {
          values[name] = v
        }
      })

      yield f.setValues({
        email: '123',
        age: '546'
      })

      expect(values).to.eql({
        email: '123',
        age: '546'
      })
    },

    'set field original values': function *() {
      const f = this.form

      yield f.setOriginalValues({
        email: '123',
        age: '546'
      })

      expect(f.fields.email.originalValue).to.eql('123')
      expect(f.fields.age.originalValue).to.eql('546')
    },

    'check if dirty': function *() {
      const f = this.form,
        fields = f.fields

      let emailDirty = false
      fields.email.isDirty = function () {
        return emailDirty
      }

      let ageDirty = false
      fields.age.isDirty = function () {
        return ageDirty
      }

      f.isDirty().must.be.false()

      emailDirty = true
      ageDirty = false
      f.isDirty().must.be.true()

      emailDirty = false
      ageDirty = true
      f.isDirty().must.be.true()

      emailDirty = true
      ageDirty = true
      f.isDirty().must.be.true()
    },

    'validate': {
      'pass': function *() {
        const f = this.form

        _.each(f.fields, function (_field, name) {
          _field.validate = function *() {}
        })

        yield f.validate()
      },

      'fail': function *() {
        const f = this.form

        const field = this.field

        _.each(f.fields, (_field, name) => {
          _field.validate = function *() {
            throw new field.FieldValidationError('fail', 400, [
              `${name} failed`,
            ])
          }
        })

        try {
          yield f.validate()
          throw new Error()
        } catch (err) {
          expect(err).to.be.instanceOf(this.formModule.FormValidationError)
          expect(err.details.email).to.eql(['email failed'])
          expect(err.details.age).to.eql(['age failed'])
        }
      }
    },

    'process the form': {
      beforeEach: function *() {
        this.markers = []

        const fn = (val) => () => {
          this.markers.push(val)
          return Q.resolve()
        }

        this.mocker.stub(this.form, 'setValues', fn(1))
        this.mocker.stub(this.form, 'validate', fn(3))
        this.mocker.stub(this.form, 'runHook', fn(5))
      },

      'request body must be set': function *() {
        try {
          yield this.form.process()
          throw new Error()
        } catch (err) {
          expect(err + '').to.contain('No request body available')
        }
      },

      'calls other functions in order': function *() {
        this.form.context = {
          request: {
            body: 2
          },
        }

        yield this.form.process()

        this.markers.must.eql([1, 3, 5])

        expect(this.form.setValues.calledWithExactly(2)).to.be.true()
        expect(this.form.runHook.calledWithExactly('postValidation')).to.be.true()
      },
    },

    'to view object': function *() {
      const f = this.form
      f.config.id = 'testForm'

      _.each(f.fields, (field, name) => {
        field[this.viewObjectMethodName] = function *(ctx) {
          return _.extend({}, ctx, {
            name: name
          })
        }
      })

      const ctx = {
        dummy: true
      }

      const viewObject = yield this.toViewObjectYieldable(f, ctx)

      expect(viewObject).to.eql({
        id: 'testForm',
        fields: {
          email: {
            name: 'email',
            dummy: true
          },
          age: {
            name: 'age',
            dummy: true
          }
        },
        order: ['email', 'age']
      })
    },
  },


  'create new Form': {
    beforeEach: function *() {
      const formDef = this.formDef = {}

      this.waigoLoadStub = this.mocker.stub(this.waigo, 'load', function () {
        return formDef
      })
    },

    'loads form definition to create the form': function *() {
      this.formDef.dummy = true

      const f = yield this.formModule.create('blah')

      expect(this.waigoLoadStub.calledOnce).to.be.true()
      expect(this.waigoLoadStub.calledWithExactly('forms/blah')).to.be.true()

      expect(f.config).to.eql({
        id: 'blah',
        dummy: true
      })

      expect(f.state).to.eql({})
    },

    'calls postCreation hook': function *() {
      this.mocker.stub(this.formModule.Form.prototype, 'runHook').returns(Q.resolve())

      const f = yield this.formModule.create({ fields: [] })

      expect(f.runHook.calledOnce).to.be.true()
      expect(f.runHook.calledWithExactly('postCreation')).to.be.true()
    },

  }
}
