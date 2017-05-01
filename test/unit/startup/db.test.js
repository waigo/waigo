

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['db'] = {
  beforeEach: function *() {
    this.createAppModules({
      'support/db/test3': 'exports.create = function *() { return Array.prototype.slice.call(arguments)}'
    })yield this.initApp()yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
      db: {
        main: {
          type: 'test3',
          hello: 'world'
        },
        main2: {
          type: 'test3',
          hello: 'world'
        },
      }
    })this.setup = waigo.load('support/startup/db')},
  afterEach: function *() {
    yield this.shutdownApp()},
  'does nothing if no config': function *() {
    delete this.App.config.dbyield this.setup(this.App)this.expect(this.App.db).to.be.undefinedthis.expect(this.App.dbs).to.eql({})},
  'otherwise sets up the db': function *() {
    yield this.setup(this.App)_.get(this.App.dbs, 'main.0').should.eql('main')_.get(this.App.dbs, 'main.2').should.eql({ type: 'test3', hello: 'world' })_.get(this.App.dbs, 'main2.0').should.eql('main2')_.get(this.App.dbs, 'main2.2').should.eql({ type: 'test3', hello: 'world' })this.App.db.should.eql(this.App.dbs.main)}    
}