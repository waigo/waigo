

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigolet form = null,
  field = null,
  errors = null,
  toViewObjectYieldable = null,
  viewObjectMethodName = nulltest['form fields'] = {
  beforeEach: function *() {
    this.createAppModules({
      'support/forms/sanitizers/test': 'module.exports = function () { return function *(fo,fi,v) { return v}}',
      'support/forms/sanitizers/test_wo': 'module.exports = function (o) { return function *(fo,fi,v) { return [o, v]}}',
      'support/forms/validators/testv': 'module.exports = function () { return function *(fo,fi,v) { return v}}',
      'support/forms/validators/testv_wo': 'module.exports = function (o) { return function *(fo,fi,v) { return [o, v]}}'
    })yield this.initApp()form = waigo.load('support/forms/form')field = waigo.load('support/forms/field')errors = waigo.load('support/errors')viewObjectMethodName = waigo.load('support/viewObjects').METHOD_NAMEtoViewObjectYieldable = waigo.load('support/viewObjects').toViewObjectYieldable},

  'FieldValidationError': {
    'extends MultipleError': function () {
      var e = new field.FieldValidationError()e.should.be.instanceOf(errors.MultipleError)},
  },

  'FieldSanitizationError': {
    'extends RuntimeError': function () {
      var e = new field.FieldSanitizationError()e.should.be.instanceOf(errors.RuntimeError)}
  },

  'Field': {
    beforeEach: function *() {
      this.form = yield form.create({
        fields: [
          {
            name: 'test',
            type: 'text'
          }
        ]
      }, {
        test: {}        
      })this.field = field.Field.new(this.form, {
        name: 'test',
        type: 'text',
      })},

    'construction': {
      'sets properties': function () {
        var f = field.Field.new(this.form, {
          type: 'text',
        })this.expect(f.form).to.eql(this.form)this.expect(f.config).to.eql({ type: 'text', })this.expect(f.sanitizers).to.eql([])this.expect(f.validators).to.eql([])},

      'initialises sanitizers': function *() {
        var f = field.Field.new(this.form, {
          type: 'text',
          sanitizers: ['test', { id: 'test_wo', option1: true }]
        })this.expect(f.sanitizers.length).to.eql(2)var fn1 = f.sanitizers[0].fnvar fn2 = f.sanitizers[1].fnlet results = yield [
          fn1(null, null, 256),
          fn2(null, null, 512)
        ]this.expect(results[0]).to.eql(256)this.expect(results[1]).to.eql([
          { option1: true },
          512
        ])},

      'initialises validators': function *() {
        var f = field.Field.new(this.form, {
          type: 'text',
          validators: ['testv', { id: 'testv_wo', option1: true }]
        })this.expect(f.validators.length).to.eql(2)var fn1 = f.validators[0].fnvar fn2 = f.validators[1].fnlet results = yield [
          fn1(null, null, 256),
          fn2(null, null, 512)
        ]this.expect(results[0]).to.eql(256)this.expect(results[1]).to.eql([
          { option1: true },
          512
        ])}
    },

    'get name': function () {
      var f = field.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })f.name.should.eql('test')},

    'get value': function () {
      var f = field.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })this.form.state.test = {
        value: 'blah'
      }f.value.should.eql('blah')},

    'set value': function () {
      var f = field.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })this.form.state.test = {
        value: 'blah'
      }f.value = 'ah'this.form.state.test.should.eql({
        value: 'ah'
      })},

    'get/set original value': function () {
      var f = field.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })f.originalValue = 'ah'f.originalValue.should.eql('ah')},

    'check if dirty': function () {
      var f = field.Field.new(this.form, {
        type: 'text',
        name: 'test'
      })f.value = 'ah'f.isDirty().should.be.truef.originalValue = 'ah'f.isDirty().should.be.falsef.value = 'blah'f.isDirty().should.be.true},

    'set sanitized value': {
      'sanitization pass': function *() {
        var f = this.fieldf.sanitizers = [
          {
            fn: function *(field, v) {
              return v + '123'}
          }
        ]

        yield f.setSanitizedValue('abc')this.expect(f.value).to.eql('abc123')},

      'sanitization fail': function *() {
        var f = this.fieldf.sanitizers = [
          {
            fn: function *(field, v) {
              throw new Error('blah')}
          }
        ]

        try {
          yield f.setSanitizedValue('abc')} catch (err) {
          err.should.be.instanceOf(field.FieldSanitizationError)err.message.should.eql('blah')}
      },

      'sanitization fail - override msg': function *() {
        var f = this.fieldf.sanitizers = [
          {
            msg: 'holla',
            fn: function *(field, v) {
              throw new Error('blah')}
          }
        ]

        try {
          yield f.setSanitizedValue('abc')} catch (err) {
          err.should.be.instanceOf(field.FieldSanitizationError)err.message.should.eql('holla')}
      },
    },


    'validate': {
      'not required and not set': {
        'null': function *() {
          var f = this.fieldf.config.required = falsef.value = nullf.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                throw new Error("blah")}
            }
          ]yield f.validate()},
        'undefined': function *() {
          var f = this.fieldf.config.required = falsef.value = undefinedf.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                throw new Error("blah")}
            }
          ]yield f.validate()},
        'empty string': function *() {
          var f = this.fieldf.config.required = falsef.value = ''f.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                throw new Error("blah")}
            }
          ]yield f.validate()},
      },
      'required and not set': {
        'null': function *() {
          var f = this.fieldf.config.required = truef.value = nullf.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                if (undefined !== v) {
                  throw new Error("blah")}
              }
            }
          ]try {
            yield f.validate()throw -1} catch (err) {
            this.expect(err).to.be.instanceOf(field.FieldValidationError)this.expect(err.details).to.eql(['Must be set'])}
        },
        'undefined': function *() {
          var f = this.fieldf.config.required = truef.value = undefinedf.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                if (undefined !== v) {
                  throw new Error("blah")}
              }
            }
          ]try {
            yield f.validate()throw -1} catch (err) {
            this.expect(err).to.be.instanceOf(field.FieldValidationError)this.expect(err.details).to.eql(['Must be set'])}
        },
        'empty string': function *() {
          var f = this.fieldf.config.required = truef.value = ''f.validators = [
            {
              id: 'testv',
              fn: function *(field, v) {
                if (undefined !== v) {
                  throw new Error("blah")}
              }
            }
          ]try {
            yield f.validate()throw -1} catch (err) {
            this.expect(err).to.be.instanceOf(field.FieldValidationError)this.expect(err.details).to.eql(['Must be set'])}
        },
      },
      'pass': function *() {
        var f = this.fieldf.config.required = truef.value = 123f.validators = [
          {
            id: 'testv',
            fn: function *(field, v) {}
          }
        ]yield f.validate()},

      'fail': function *() {
        var f = this.fieldf.config.required = truef.value = 123f.validators = [
          {
            id: 'testv',
            fn: function *(field, v) {
              throw new Error('blah' + 123)}
          }
        ]try {
          yield f.validate()throw -1} catch (err) {
          this.expect(err).to.be.instanceOf(field.FieldValidationError)this.expect(err.details).to.eql(['blah123'])}
      },

      'override error message': function *() {
        var f = this.fieldf.config.required = truef.value = 123f.validators = [
          {
            id: 'testv',
            msg: 'hoola',
            fn: function *(field, v) {
              throw new Error('blah' + 123)}
          }
        ]try {
          yield f.validate()throw -1} catch (err) {
          this.expect(err).to.be.instanceOf(field.FieldValidationError)this.expect(err.details).to.eql(['hoola'])}
      }, 

    },

    'to view object': function *() {
      var f = this.fieldf.config.type = 'text'f.config.label = 'Name'f.config.helpText = 'bla bla bla'f.config.meta = {
        multiline: true,
        dummyKey: 1,
      }f.value = 87f.originalValue = 98let viewObject = yield toViewObjectYieldable(f)this.expect(viewObject).to.eql({
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
      })}
  },

  'create new Field': {
    'loads field class and constructs and instance': function *() {
      var newForm = yield form.create({
        fields: [{
          name: 'blah2',
          type: 'text'
        }]
      })var f = field.Field.new(newForm, {
        name: 'blah',
        type: 'text'
      })f.should.be.instanceOf(field.Field)f.should.be.instanceOf(waigo.load('support/forms/fields/text'))this.expect(f.config).to.eql({
        name: 'blah',
        type: 'text'
      })}
  }

}