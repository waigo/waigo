

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['rethinkdb'] = {
  beforeEach: function *() {
    yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })this.ctx = {
      App: this.App,
    }this.rethinkdb = waigo.load('support/db/rethinkdb')},

  afterEach: function *() {
    if (this.db) {
      try {
        yield this.db.disconnect()} catch (err) {}
    }

    yield this.shutdownApp()},

  'can create': function *() {
    this.db = yield this.rethinkdb.create('main', this.App.logger, {
      serverConfig: {
        db: 'waigo',
        servers: [
          {
            host: '127.0.0.1',
            port: 28015,
          }
        ],        
      },
    })let users = yield (yield this.db.model('User')).rawQry().run()users.length.should.be.defined},

  'can shutdown': function *() {
    this.db = yield this.rethinkdb.create('main', this.App.logger, {
      serverConfig: {
        db: 'waigo',
        servers: [
          {
            host: '127.0.0.1',
            port: 28015,
          }
        ],        
      },
    })yield this.rethinkdb.closeAll(this.App.logger)try {
      yield (yield this.db.model('User')).rawQry().run()throw -1} catch (err) {
      err.toString().toLowerCase().should.contain('cannot read property')
    }
  }
}