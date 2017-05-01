

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['cron'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })this.shutdownStep = waigo.load('support/shutdown/cron')this.App.cron = {
      test: {
        stopScheduler: () => {
          this.App.count++}
      },
      test2: {
        stopScheduler: () => {
          this.App.count++}
      },
    }this.App.count = 0},
  afterEach: function *() {
    yield this.shutdownApp()},
  'stops cron job': function *() {
    yield this.shutdownStep(this.App)this.App.count.should.eql(2)}    
}