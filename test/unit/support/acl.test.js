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
    this.inst = yield this.acl.init(this.App);
    
    let rows = yield this.App.models.Acl.getAll();

    rows.length.should.eql(1);
    _.omit(rows[0].toJSON(), 'id').should.eql({
      resource: 'admin',
      entityType: 'role',
      entity: 'admin'
    });
  },
  'does not auto-insert admin records if already present': function*() {
    yield this.App.models.Acl.insert({
      resource: 'admin',
      entityType: 'user',
      entity: 'testuser'
    });

    this.inst = yield this.acl.init(this.App);
    
    let rows = yield this.App.models.Acl.getAll();

    rows.length.should.eql(1);
    _.omit(rows[0].toJSON(), 'id').should.eql({
      resource: 'admin',
      entityType: 'user',
      entity: 'testuser'
    });
  },
  'check access': {
    beforeEach: function*() {
      this.users = yield {
        admin: this.App.models.User.register({
          username: 'test',
          roles: ['admin'],
        }),
        john: this.App.models.User.register({
          username: 'john',
          roles: ['joker'],
        }),
        mark: this.App.models.User.register({
          username: 'mark',
          roles: [],
        }),
      };

      yield [
        this.App.models.Acl.insert({
          resource: 'admin',
          entityType: 'role',
          entity: 'admin',
        }),
        this.App.models.Acl.insert({
          resource: 'jokerbox',
          entityType: 'role',
          entity: 'joker',
        }),
        this.App.models.Acl.insert({
          resource: 'pandabox',
          entityType: 'role',
          entity: 'panda',
        }),
        this.App.models.Acl.insert({
          resource: 'catbox',
          entityType: 'user',
          entity: this.users.john.id,
        }),
      ];

      this.mocker.stub(this.App.models.Acl, 'onChange', () => {
        return Q.resolve(null);
      });

      this.inst = yield this.acl.init(this.App);
    },

    'public': function*() {
      this.inst.can('public', this.users.admin).should.be.true;
      this.inst.can('public', this.users.john).should.be.true;
      this.inst.can('public', this.users.mark).should.be.true;
    },

    'admins can access anything': function*() {
      this.inst.can('jokerbox', this.users.admin).should.be.true;
      this.inst.can('pandabox', this.users.john).should.be.false;
      this.inst.can('pandabox', this.users.mark).should.be.false;
    },

    'if resource not present then only admins can access': function*() {
      this.inst.can('dogbox', this.users.admin).should.be.true;
      this.inst.can('dogbox', this.users.john).should.be.false;      
      this.inst.can('dogbox', this.users.mark).should.be.false;      
    },

    'resource accessible to single user': function*() {
      this.inst.can('catbox', this.users.admin).should.be.true;
      this.inst.can('catbox', this.users.john).should.be.true;      
      this.inst.can('catbox', this.users.mark).should.be.false;      
    },

    'resource accessible to a role': function*() {
      this.inst.can('jokerbox', this.users.admin).should.be.true;
      this.inst.can('jokerbox', this.users.john).should.be.true;      
      this.inst.can('jokerbox', this.users.mark).should.be.false;      
    },

    'assertions': {
      'pass': function*() {
        this.inst.assert('jokerbox', this.users.john);
      },

      'fail': function*() {
        this.expect(() => {
          this.inst.assert('jokerbox', this.users.mark);
        }).to.throw(`User ${this.users.mark.id} does not have permission to access: jokerbox`);
      },
    },
  },
  'can reload': function*() {
    this.inst = yield this.acl.init(this.App);

    yield this.inst.reload();
  },
  'watches for changes and reloads': function*() {
    this.inst = yield this.acl.init(this.App);

    let user = yield this.App.models.User.register({
      username: 'tester',
      roles: ['test'],
    });

    this.inst.can('admin', user).should.be.false;

    let spy = this.mocker.spy(this.inst, 'reload');
    
    yield this.App.db._connection.table('Acl').insert({
      resource: 'admin',
      entityType: 'role',
      entity: 'test'
    });

    yield Q.delay(100);

    spy.should.have.been.calledOnce;

    this.inst.can('admin', user).should.be.true;
  },
};

