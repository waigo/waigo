

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['action tokens'] = {
  beforeEach: function *() {
    this.createAppModules({
      'support/actionTokens': 'module.exports = { init: function *() { return Array.from(arguments).concat(1)} }'
    })yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
      actionTokens: {
        dummy: true,
      },
    })this.setup = waigo.load('support/startup/actionTokens')},
  afterEach: function *() {
    yield this.shutdownApp()},
  'init action tokens': function *() {
    yield this.setup(this.App)this.App.actionTokens.should.eql([this.App, { dummy: true }, 1])},
}