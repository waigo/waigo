

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['routes'] = {
  beforeEach: function *() {
    this.createAppModules({
      'support/routeMapper': 'exports.setup = function *() { return arguments}'
    })yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
      middleware: {
        dummy: true,
      },
    })this.setup = waigo.load('support/startup/routes')},

  afterEach: function *() {
    yield this.shutdownApp()},

  'loads routes': function *() {
    yield this.setup(this.App)let routesToLoad = _.reduce(waigo.getItemsInFolder('routes'), (soFar, n) => {
      return _.merge(soFar, waigo.load(n))}, {})_.get(this.App, 'routes.2').must.eql(routesToLoad)_.get(this.App, 'routes.1').must.eql({ dummy: true })_.get(this.App, 'routes.0').must.eql(this.App)},

}