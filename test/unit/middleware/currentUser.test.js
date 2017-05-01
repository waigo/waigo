

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigovar middleware = nulltest['context helpers'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp({
      startupSteps: ['db', 'models'],
      shutdownSteps: ['db'],
    })yield this.clearDb('User')middleware = waigo.load('support/middleware/currentUser')},

  afterEach: function *() {
    yield this.shutdownApp()},

  'no user': function *() {
    let ctx = {
      session: {},
    }let count = 0let next = function *() {
      count++}

    yield middleware().call(ctx, next)this.expect(ctx.currentUser).to.not.be.definedcount.should.eql(1)},

  'has user': function *() {
    let user = yield this.App.models.User.register({
      username: 'test',
    })let ctx = {
      App: this.App,
      session: {
        user: {
          id: user.id,
        }
      },
    }let count = 0let next = function *() {
      count++}

    yield middleware().call(ctx, next)this.expect(ctx.currentUser).to.be.definedctx.currentUser.toJSON().should.eql(user.toJSON())count.should.eql(1)},
}