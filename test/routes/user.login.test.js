

const _ = require('lodash'),
  co = require('co'),
  FormData = require('form-data'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['login'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp()yield this.clearDb()this.basePath = '/user/login'},
  afterEach: function *() {
    yield this.shutdownApp()},
  GET: {
    'html': function *() {
      let res = yield this.fetch(this.basePath)res.body.should.contain('Login')res.body.should.contain('<form')},
    'json': function *() {
      let res = yield this.fetch(this.basePath, {
        query: {
          format: 'json',
        }
      })let json = JSON.parse(res.body)json.form.should.be.defined},      
  },
  'POST': {
    failure: {
      html: function *() {
        try {
          yield this.fetch(this.basePath, {
            method: 'POST',
            body: {},
          })throw -1} catch (err) {
          err.statusCode.should.eql(400)let body = err.response.bodybody.should.contain('<form')body.should.contain('FormValidationError')body.should.contain('Password: Must be set')body.should.contain('CSRF: Must be set')body.should.contain('Email address / Username: Must be set')}          
      },
      json: function *() {
        try {
          yield this.fetch(this.basePath, {
            method: 'POST',
            body: {},
            query: {
              format: 'json'
            }
          })throw -1} catch (err) {
          let body = JSON.parse(err.response.body)body.form.should.be.definedbody.error.type.should.eql('FormValidationError')body.error.details.email[0].should.eql('Must be set')body.error.details.password[0].should.eql('Must be set')body.error.details.__csrf[0].should.eql('Must be set')}
      },
    },
    'check credentials': {
      beforeEach: function *() {
        yield this.App.models.User.register({
          username: 'test123',
          email: 'test@waigojs.com',
          password: 'blah',
        })this.loginUser = (function *(opts) {
          const res = yield this.fetch(this.basePath, {
            query: {
              format: 'json'
            }
          })const body = JSON.parse(res.body)const cookie = res.headers['set-cookie']let form = _.extend({
            '__csrf': body.form.fields.__csrf.value
          }, opts.body)this.res = yield this.fetch(this.basePath, _.extend({
            method: 'POST',
            headers: {
              cookie: cookie,
            },
            query: {
              format: 'json'
            },
            body: form,
          }, _.omit(opts, 'body')))}).bind(this)},
      'bad username': function *() {
        try {
          yield this.loginUser({
          body: {
            email: 'wer',
            password: 'blah',
          }
        })throw -1} catch (err) {
          err.response.body.should.contain('Incorrect username or password')}
      },
      'username ok, bad password': function *() {
        try {
          yield this.loginUser({
          body: {
            email: 'test123',
            password: 'blah2',
          }
        })throw -1} catch (err) {
          err.response.body.should.contain('Incorrect username or password')}
      },
      'username ok': function *() {
        yield this.loginUser({
          body: {
            email: 'test123',
            password: 'blah',
          }
        })let body = JSON.parse(this.res.body)body.redirectTo.should.eql('/')},
      'email ok': function *() {
        yield this.loginUser({
          body: {
            email: 'test@waigojs.com',
            password: 'blah',
          }
        })},
      'sets cookie': function *() {
        yield this.loginUser({
          body: {
            email: 'test@waigojs.com',
            password: 'blah',
          }
        })this.res.headers['set-cookie'][0].should.contain('test123')},
      'can redirect': function *() {
        yield this.loginUser({
          body: {
            email: 'test@waigojs.com',
            password: 'blah',
            postLoginUrl: '/user',
          }
        })let body = JSON.parse(this.res.body)body.redirectTo.should.eql('/user')},
    }
  },
}