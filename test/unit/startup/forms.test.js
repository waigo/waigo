

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['forms'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })this.setup = waigo.load('support/startup/forms')},
  afterEach: function *() {
    yield this.shutdownApp()},
  'sets form accessor': function *() {
    yield this.setup(this.App)this.App.form.must.eql(waigo.load('support/forms/form'))},
}