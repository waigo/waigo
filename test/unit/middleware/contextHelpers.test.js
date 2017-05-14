

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigovar middleware = nulltest['context helpers'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })middleware = waigo.load('support/middleware/contextHelpers')},

  afterEach: function *() {
    yield this.shutdownApp()},

  'sets context': function *() {
    let ctx = {
      currentUser: 2,
      request: {
        url: 53,
      },
      App: {
        logger: 1,
        acl: 3,
        models: 4,
        form: 5,
      }
    }let count = 0let next = function *() {
      count++}

    yield middleware().call(ctx, next)this.expect(_.get(ctx, 'templateVars.currentUser', '')).to.eql(2)this.expect(_.get(ctx, 'templateVars.currentUrl', '')).to.eql(53)this.expect(ctx.logger).to.eql(1)this.expect(ctx.acl).to.eql(3)this.expect(ctx.models).to.eql(4)this.expect(ctx.form).to.eql(5)count.must.eql(1)},

}