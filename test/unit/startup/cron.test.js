

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['app template vars'] = {
  beforeEach: function *() {
    this._init = _.bind(co.wrap(function *() {
      yield this.initApp()yield this.startApp({
        startupSteps: ['db', 'models'],
        shutdownSteps: ['cron', 'db'],
      })this.setup = waigo.load('support/startup/cron')}), this)},

  afterEach: function *() {
    yield this.shutdownApp()},

  'default': function *() {
    yield this._init()yield this.setup(this.App)this.App.cron.notifyAdminsAboutUserStats.must.be.defined},

  'custom': {
    beforeEach: function *() {
      this.createAppModules({
        'support/cronTasks/test': 'exports.schedule = "* * * * * *"exports.handler = function *(app) { app.count++}'
      })yield this._init()this.App.count = 0},

    'view object': function *() {
      yield this.setup(this.App)this.App.cron.test.must.be.definedlet viewObject = 
        yield waigo.load('support/viewObjects').toViewObjectYieldable(this.App.cron.test)viewObject.id.must.eql('test')viewObject.disabled.must.be.falseviewObject.lastRun.must.eql('never')viewObject.schedule.must.eql('* * * * * *')this.expect(60 >= moment().diff(viewObject.nextRun, 'seconds')).to.be.true},
  },

}