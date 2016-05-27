"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['db'] = {
  beforeEach: function*() {
    this.createAppModules({
      'support/db/test': 'module.exports = { create: function*() { return Array.prototype.slice.call(arguments); } }; '
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
      db: {
        main: {
          type: 'test',
          hello: 'world'
        },
        main2: {
          type: 'test',
          hello: 'world'
        },
      }
    });

    this.setup = waigo.load('support/startup/db');
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'does nothing if no config': function*() {
    delete this.app.config.db;

    yield this.setup(this.app);

    this.expect(this.app.db).to.be.undefined;
    this.expect(this.app.dbs).to.eql({});
  },
  'otherwise sets up the db': function*() {
    yield this.setup(this.app);

    _.get(this.app.dbs, 'main.0').should.eql('main');
    _.get(this.app.dbs, 'main.2').should.eql({ type: 'test', hello: 'world' });

    _.get(this.app.dbs, 'main2.0').should.eql('main2');
    _.get(this.app.dbs, 'main2.2').should.eql({ type: 'test', hello: 'world' });

    this.app.db.should.eql(this.app.dbs.main);
  }    
};
