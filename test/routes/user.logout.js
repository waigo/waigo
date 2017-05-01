

const _ = require('lodash'),
  co = require('co'),
  FormData = require('form-data'),
  path = require('path'),
  moment = require('moment'),
  qs = require('query-string'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['logout'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp()yield this.clearDb()this.basePath = '/user/logout'this.user = yield this.App.models.User.register({
      username: 'test123',
      email: 'test@waigojs.com',
      password: 'blah',
    })/*
    submit login form to get link
     */
    let res = yield this.fetch('/user/login', {
      query: {
        format: 'json'
      }
    })res = yield this.fetch('/user/login', {
      method: 'POST',
      headers: {
        cookie: res.headers['set-cookie'],
      },
      query: {
        format: 'json'
      },
      body: {
        email: 'test123',
        password: 'blah',
        '__csrf': JSON.parse(res.body).form.fields.__csrf.value
      }
    })res.headers['set-cookie'][0].should.contain('test123')this.cookie = res.headers['set-cookie']},
  afterEach: function *() {
    yield this.shutdownApp()},
  GET: {
    'html': function *() {
      let res = yield this.fetch(this.basePath, {
        headers: {
          cookie: this.cookie,
        }
      })res.body.should.contain('Welcome')this.expect(res.headers['set-cookie']).to.not.be.defined},
    'json': function *() {
      let res = yield this.fetch(this.basePath, {
        headers: {
          cookie: this.cookie,
        },
        query: {
          format: 'json',
        }
      })let json = JSON.parse(res.body)json.redirectTo.should.eql('/')this.expect(res.headers['set-cookie']).to.not.be.defined},      
  },
}