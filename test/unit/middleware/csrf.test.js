

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigovar middleware = nulltest['context helpers'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })middleware = waigo.load('support/middleware/csrf')},

  afterEach: function *() {
    yield this.shutdownApp()},

  'csrf': function *() {
    let ctx = {
      response: {},
      request: {},
    }let count = 0let next = function *() {
      count++}

    yield middleware().call(ctx, next)this.expect(ctx.assertCSRF).to.be.definedthis.expect(ctx.request.assertCSRF).to.be.definedcount.must.eql(1)},

}