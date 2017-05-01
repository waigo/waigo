

const _ = require('lodash'),
  co = require('co'),
  FormData = require('form-data'),
  path = require('path'),
  moment = require('moment'),
  qs = require('query-string'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['reset password'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp()yield this.clearDb()this.basePath = '/user/reset_password'this.user = yield this.App.models.User.register({
      username: 'test123',
      email: 'test@waigojs.com',
      password: 'blah',
    })/*
    submit forgot password form to get reset link
     */
    let res = yield this.fetch('/user/forgot_password', {
      query: {
        format: 'json'
      }
    })this.mocker.stub(this.App.mailer, 'send', () => Q.resolve())yield this.fetch('/user/forgot_password', {
      method: 'POST',
      headers: {
        cookie: res.headers['set-cookie'],
      },
      query: {
        format: 'json'
      },
      body: {
        email: this.user.username,
        '__csrf': JSON.parse(res.body).form.fields.__csrf.value
      }
    })this.link = _.get(this.App.mailer.send, 'args.0.0.templateVars.link')
      .substr(this.App.config.baseURL.length)this.getForm = (function *(opts) {
      let qry = qs.parse(this.link.substr(this.link.indexOf('?')+1))_.extend(qry, opts ? opts.query : {})this.res1 = yield this.fetch(this.link, _.extend({
        query: qry
      }, _.omit(opts, 'query')))}).bind(this)},
  afterEach: function *() {
    yield this.shutdownApp()},
  GET: {
    'html': function *() {
      yield this.getForm()this.res1.body.should.contain('Reset password')this.res1.body.should.contain('<form')},
    'json': function *() {
      yield this.getForm({
        query: {
          format: 'json',
        }
      })let json = JSON.parse(this.res1.body)json.form.should.be.defined},      
    'user logged in': function *() {
      yield this.getForm({
        query: {
          format: 'json',
        }
      })this.res1.headers['set-cookie'][0].should.contain(this.user.username)},      
  },
  'POST': {
    beforeEach: function *() {
      yield this.getForm({
        query: {
          format: 'json'
        }
      })const cookie = this.res1.headers['set-cookie']const json = JSON.parse(this.res1.body)this.submitForm = _.bind(function *(formData, opts) {
        let form = _.extend({
          '__csrf': json.form.fields.__csrf.value
        }, formData)this.res2 = yield this.fetch(this.basePath, _.extend({
          method: 'POST',
          headers: {
            cookie: cookie,
          },
          body: form,
        }, opts))}, this)},
    failure: {
      html: function *() {
        try {
          yield this.submitForm()throw -1} catch (err) {
          err.statusCode.should.eql(400)let body = err.response.bodybody.should.contain('<form')body.should.contain('FormValidationError')body.should.contain('New password: Must be set')body.should.contain('Confirm password: Must be set')}          
      },
      json: function *() {
        try {
          yield this.submitForm({}, {
            query: {
              format: 'json'
            }
          })throw -1} catch (err) {
          let body = JSON.parse(err.response.body)body.form.should.be.definedbody.error.type.should.eql('FormValidationError')body.error.details.password[0].should.eql('Must be set')body.error.details.confirm_password[0].should.eql('Must be set')}
      },
    },
    'do it!': {
      'password mismatch': function *() {
        try {
          yield this.submitForm({
            password: 'test',
            confirm_password: 'a',
          }, {
            query: {
              format: 'json'
            },
          })throw -1} catch (err) {
          err.response.body.should.contain('Must be equal to New password')}
      },
      'password updated': function *() {
        yield this.submitForm({
          password: 'iuter',
          confirm_password: 'iuter',
        }, {
          query: {
            format: 'json'
          },
        })yield this.user.reload()(yield this.user.isPasswordCorrect('iuter')).should.be.true},
      'send email': function *() {
        yield this.submitForm({
          password: 'iuter',
          confirm_password: 'iuter',
        }, {
          query: {
            format: 'json'
          },
        })let _call = this.App.mailer.send.getCall(this.App.mailer.send.callCount - 1)_.get(_call, 'args.0.to.id').should.eql(this.user.id)_.get(_call, 'args.0.subject').should.eql('Your password has been updated')},
      'alerts user': function *() {
        yield this.submitForm({
          password: 'iuter',
          confirm_password: 'iuter',
        }, {
          query: {
            format: 'json'
          },
        })JSON.parse(this.res2.body).alert.should.eql('Your new password has been saved')},
    },
  },
}