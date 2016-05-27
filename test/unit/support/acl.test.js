"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['acl'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: ['db', 'models'],
      shutdownSteps: ['db'],
    });

    yield this.clearDb();

    this.acl = waigo.load('support/acl');
  },
  afterEach: function*() {
    if (this.inst) {
      yield this.inst.shutdown();
    } 

    yield this.shutdownApp();
  },
  'auto-inserts admin records': function*() {
    this.inst = yield this.acl.init(this.app);
    
    let rows = yield this.app.models.Acl.getAll();

    rows.length.should.eql(1);
    _.omit(rows[0].toJSON(), 'id').should.eql({
      resource: 'admin',
      entityType: 'role',
      entity: 'admin'
    });
  },
  'does not auto-insert admin records if already present': function*() {
    yield this.app.models.Acl.insert({
      resource: 'admin',
      entityType: 'user',
      entity: 'testuser'
    });

    this.inst = yield this.acl.init(this.app);
    
    let rows = yield this.app.models.Acl.getAll();

    rows.length.should.eql(1);
    _.omit(rows[0].toJSON(), 'id').should.eql({
      resource: 'admin',
      entityType: 'user',
      entity: 'testuser'
    });
  },
  'watches for changes and reloads': function*() {
    this.inst = yield this.acl.init(this.app);

    let spy = this.mocker.spy(this.inst, 'reload');
    
    yield this.app.db._connection.table('Acl').insert({
      resource: 'admin',
      entityType: 'user',
      entity: 'testuser'
    });

    yield Q.delay(100);

    spy.should.have.been.calledOnce;
  },
};

