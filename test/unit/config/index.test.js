

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest.beforeEach = function *() {
  this.deleteTestFolders()this.createTestFolders()}test.afterEach = function *() {
  this.deleteTestFolders()}test['config loader'] = {
  beforeEach: function *() {
    this.originalMode = process.env.NODE_ENVlet modulesToCreate = {
      'config/base': 'module.exports = function (config) { config.base = 1 }',
      'config/development': 'module.exports = function (config) { config.dev = 1 }',
      'config/random': 'module.exports = function (config) { config.random = 1 }',
      'config/error': 'module.exports = function (config) { throw new Error("haha") }'
    }modulesToCreate['config/development.' + process.env.USER] = 'module.exports = function (config) { config.dev_user = 1 }'this.createAppModules(modulesToCreate)yield this.initApp()},
  afterEach: function *() {
    process.env.NODE_ENV = this.originalModethis.deleteTestFolders()},
  'defaults': function *() {
    process.env.NODE_ENV = 'development'waigo.load('config/index')().should.eql({
      mode: 'development',
      user: process.env.USER,
      base: 1,
      dev: 1,
    })},
  'set mode': function *() {
    process.env.NODE_ENV = 'random'var config = waigo.load('config/index')waigo.load('config/index')().should.eql({
      mode: 'random',
      user: process.env.USER,
      base: 1,
      random: 1
    })},
  'set bad mode': function *() {
    process.env.NODE_ENV = 'notfound'var config = waigo.load('config/index')waigo.load('config/index')().should.eql({
      mode: 'notfound',
      user: process.env.USER,
      base: 1
    })},
  'error in config file': function *() {
    process.env.NODE_ENV = 'error'var config = waigo.load('config/index')this.expect(waigo.load('config/index')).to.throw('haha')}
}