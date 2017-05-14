

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['mailer'] = {
  beforeEach: function *() {
    this.createAppModules({
      'support/mailer/test': 'exports.create = function *() { return Array.from(arguments)}',
    })yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })this.setup = waigo.load('support/startup/mailer')},
  afterEach: function *() {
    yield this.shutdownApp()},
  'mailer config not set': function *() {
    this.App.config.mailer = nullyield this.shouldThrow(this.setup(this.App), 'Mailer type not set')},
  'mailer type invalid': function *() {
    this.App.config.mailer = { type: 'invalid' }yield this.shouldThrow(this.setup(this.App), 'File not found')},
  'mailer type valid': function *() {
    this.App.config.mailer = { type: 'test', dummy: true }yield this.setup(this.App)this.App.mailer.must.eql([ this.App, { type: 'test', dummy: true } ])},
}