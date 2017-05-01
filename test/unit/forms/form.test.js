

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigolet form = null,
  field = null,
  errors = null,
  toViewObjectYieldable = null,
  viewObjectMethodName = nulltest['forms'] = {
  beforeEach: function *() {
    yield this.initApp()form = waigo.load('support/forms/form')field = waigo.load('support/forms/field')errors = waigo.load('support/errors')viewObjectMethodName = waigo.load('support/viewObjects').METHOD_NAMEtoViewObjectYieldable = waigo.load('support/viewObjects').toViewObjectYieldable},

  'FormValidationError': {
    'extends MultipleError': function *() {
      let e = new form.FormValidationError()e.should.be.instanceOf(errors.MultipleError)},
    'default toViewObject': function *() {
      let e = new form.FormValidationError('test', 400, {
        field1: {
          val1: 'blah1',
          val2: 'blah2',
        },
        field2: {
          val1: 'blah3',
          val2: 'blah4',
        },
      })let actualViewObject = yield toViewObjectYieldable(e)let me = new errors.MultipleError('test', 400, e.details)let expectedViewObject = yield toViewObjectYieldable(me)expectedViewObject.type = 'FormValidationError'this.expect(actualViewObject).to.eql(expectedViewObject)},
  },

  'Form': {
    'beforeEach': function *() {
      this.newFieldSpy = this.mocker.stub(field.Field, 'new', function(form, def) {
        return {
          name: def.name + ' created'
        }})this.formConfig = {
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

      this.form = yield form.create(this.formConfig)},

    'construction': {
      'initialises state': function *() {
        var f = yield form.create(this.formConfig)this.expect(f.state).to.eql({ 
          email: { 
            value: undefined 
          }, 
          age: { 
            value: undefined
          }
        })},

      'initialises config': function *() {
        var f = yield form.create(this.formConfig)this.expect(f.config).to.eql(this.formConfig)},

      'initialises fields': function *() {
        var f = this.formthis.expect(f._fields).to.eql({
          email: {name: 'email created'},
          age: {name: 'age created'}
        })this.newFieldSpy.should.have.been.calledTwicethis.newFieldSpy.should.have.been.calledWithExactly(f, f.config.fields[0])this.newFieldSpy.should.have.been.calledWithExactly(f, f.config.fields[1])},

      'can re-use stuff from existing Form': function *() {
        this.form.state = {
          email: 'test',
          age: 12
        }var f = yield form.create(this.form)this.expect(f.config).to.eql(this.form.config)this.expect(f._fields).to.eql(this.form.fields)this.expect(f.state).to.eql(this.form.state)},

      'but can pass in state to override state from existing Form': function *() {
        this.form.state = {
          email: 'test',
          age: 12
        }var f = yield form.create(this.form, {
          state: {
            email: 'blah',
            age: 23
          },
        })this.expect(f.config).to.eql(this.form.config)this.expect(f._fields).to.eql(this.form.fields)this.expect(f.state).to.eql({
          email: 'blah',
          age: 23
        })}      
    },

    'get fields': function *() {
      var f = this.formf._fields = 'test'this.expect(f.fields).to.eql('test')},

    'get state': function *() {
      var f = this.formf._state = 'test'this.expect(f.state).to.eql('test')},

    'set state': function *() {
      var f = this.formvar state = {
        email: {
          value: 123
        },
        test: {
          value: false
        }
      }f.state = statethis.expect(f.state).to.eql({
        email: {
          value: 123
        },
        test: {
          value: false
        },
        age: {
          value: undefined
        }
      })},

    'set field values': function *() {
      var f = this.formvar values = {}_.each(f.fields, function(field, name) {
        field.setSanitizedValue = function *(v) {
          values[name] = v}})yield f.setValues({
        email: '123',
        age: '546'
      })this.expect(values).to.eql({
        email: '123',
        age: '546'
      })},

    'set field original values': function *() {
      var f = this.formyield f.setOriginalValues({
        email: '123',
        age: '546'
      })this.expect(f.fields.email.originalValue).to.eql('123')this.expect(f.fields.age.originalValue).to.eql('546')},

    'check if dirty': function *() {
      var f = this.form,
        fields = f.fieldsvar emailDirty = falsefields.email.isDirty = function() {
        return emailDirty}var ageDirty = falsefields.age.isDirty = function() {
        return ageDirty}f.isDirty().should.be.falseemailDirty = trueageDirty = falsef.isDirty().should.be.trueemailDirty = falseageDirty = truef.isDirty().should.be.trueemailDirty = trueageDirty = truef.isDirty().should.be.true},

    'validate': {
      'pass': function *() {
        var f = this.form_.each(f.fields, function(_field, name) {
          _field.validate = function *() {}})yield f.validate()},

      'fail': function *() {
        var f = this.form_.each(f.fields, function(_field, name) {
          _field.validate = function *() {
            throw new field.FieldValidationError('fail', 400, [
              `${name} failed`,
            ])}})try {
          yield f.validate()throw -1} catch (err) {
          this.expect(err).to.be.instanceOf(form.FormValidationError)this.expect(err.details.email).to.eql(['email failed'])this.expect(err.details.age).to.eql(['age failed'])}
      }
    },

    'process the form': {
      beforeEach: function *() {
        this.markers = []let fn = (val) => () => {
          this.markers.push(val)return Q.resolve()}this.mocker.stub(this.form, 'setValues', fn(1))this.mocker.stub(this.form, 'validate', fn(3))this.mocker.stub(this.form, 'runHook', fn(5))},

      'request body must be set': function *() {
        try {
          yield this.form.process()throw -1} catch (err) {
          this.expect(err + '').to.contain('No request body available')}
      },

      'calls other functions in order': function *() {
        this.form.context = {
          request: {
            body: 2
          },
        }yield this.form.process()this.markers.should.eql([1, 3, 5])this.form.setValues.should.have.been.calledWithExactly(2)this.form.runHook.should.have.been.calledWithExactly('postValidation')},
    },

    'to view object': function *() {
      var f = this.formf.config.id = 'testForm'_.each(f.fields, function(field, name) {
        field[viewObjectMethodName] = function *(ctx) {
          return _.extend({}, ctx, {
            name: name
          })}})var ctx = {
        dummy: true
      }let viewObject = yield toViewObjectYieldable(f, ctx)this.expect(viewObject).to.eql({
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
      })},
  },


  'create new Form': {
    beforeEach: function *() {
      var formDef = this.formDef = {}this.waigoLoadStub = this.mocker.stub(waigo, 'load', function(){
        return formDef})},

    'loads form definition to create the form': function *() {
      this.formDef.dummy =  truevar f = yield form.create('blah')this.waigoLoadStub.should.have.been.calledOncethis.waigoLoadStub.should.have.been.calledWithExactly('forms/blah')this.expect(f.config).to.eql({
        id: 'blah',
        dummy: true
      })this.expect(f.state).to.eql({})},

    'calls postCreation hook': function *() {
      this.mocker.stub(form.Form.prototype, 'runHook').returns(Q.resolve())let f = yield form.create({ fields: [] })f.runHook.should.have.been.calledOncef.runHook.should.have.been.calledWithExactly('postCreation')},

  }
}