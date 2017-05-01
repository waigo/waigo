

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['notifications'] = {
  beforeEach: function *() {
    this.createAppModules({
      'support/notifications/test1': 'module.exports = function (app, id, cfg) { return function *() { app.count1.push(arguments)} }',
      'support/notifications/test2': 'module.exports = function (app, id, cfg) { return function *() { app.count2.push(arguments)} }',
      'support/notifications/test3': 'module.exports = function (app, id, cfg) { return function *() { app.count3.push(arguments)} }',
    })yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })this.setup = waigo.load('support/startup/notifications')this.App.count1 = []this.App.count2 = []this.App.count3 = []},

  afterEach: function *() {
    yield this.shutdownApp()},

  'invalid types': function *() {
    this.App.config.notifications = {
      admins: {
        transports: [{ type: 'invalid' }]
      }
    }yield this.shouldThrow(this.setup(this.App), 'File not found: support/notifications/invalid')},

  'valid types': function *() {
    this.App.config.notifications = {
      admins: {
        transports: [{ type: 'test1'}, { type: 'test2'}]
      },
      admins2: {
        transports: [{ type: 'test3'}]
      },
    }yield this.setup(this.App)this.App.emit('notify', 'admins', 'test')this.App.emit('notify', 'admins2', 'test2')this.App.count1.should.eql['test']this.App.count2.should.eql['test']this.App.count3.should.eql['test2']},

}