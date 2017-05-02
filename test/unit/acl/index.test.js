const _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['acl'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: ['db', 'users']
    })

    yield this.clearDb('Acl')

    this.acl = this.waigo.load('acl')
  },
  afterEach: function *() {
    if (this.inst) {
      yield this.inst.destroy()

      this.inst = null
    }

    yield this.shutdownApp()
  },
  'auto-inserts admin records': function *() {
    this.inst = yield this.acl.init(this.App)

    const rows = yield this.inst.dbModel.getAll()

    rows.length.must.eql(1)
    _.omit(rows[0].toJSON(), 'id').must.eql({
      resource: 'admin',
      entityType: 'role',
      entity: 'admin'
    })
  },
  'does not auto-insert admin records if already present': function *() {
    yield (yield this.App.db.model('Acl')).insert({
      resource: 'admin',
      entityType: 'user',
      entity: 'testuser'
    })

    this.inst = yield this.acl.init(this.App)

    const rows = yield this.inst.dbModel.getAll()

    rows.length.must.eql(1)

    _.omit(rows[0].toJSON(), 'id').must.eql({
      resource: 'admin',
      entityType: 'user',
      entity: 'testuser'
    })
  },
  'check access': {
    beforeEach: function *() {
      this.users = yield {
        admin: this.App.users.register({
          username: 'test',
          roles: ['admin'],
        }),
        john: this.App.users.register({
          username: 'john',
          roles: ['joker'],
        }),
        mark: this.App.users.register({
          username: 'mark',
          roles: [],
        }),
      }

      const model = (yield this.App.db.model('Acl'))

      yield [
        model.insert({
          resource: 'admin',
          entityType: 'role',
          entity: 'admin',
        }),
        model.insert({
          resource: 'jokerbox',
          entityType: 'role',
          entity: 'joker',
        }),
        model.insert({
          resource: 'pandabox',
          entityType: 'role',
          entity: 'panda',
        }),
        model.insert({
          resource: 'catbox',
          entityType: 'user',
          entity: this.users.john.id,
        }),
      ]

      this.mocker.stub(model, 'onChange', () => {
        return Q.resolve(null)
      })

      this.inst = yield this.acl.init(this.App)
    },

    'public': function *() {
      this.inst.can('public', this.users.admin).must.be.true()
      this.inst.can('public', this.users.john).must.be.true()
      this.inst.can('public', this.users.mark).must.be.true()
    },

    'admins can access anything': function *() {
      this.inst.can('jokerbox', this.users.admin).must.be.true()
      this.inst.can('pandabox', this.users.john).must.be.false()
      this.inst.can('pandabox', this.users.mark).must.be.false()
    },

    'if resource not present then only admins can access': function *() {
      this.inst.can('dogbox', this.users.admin).must.be.true()
      this.inst.can('dogbox', this.users.john).must.be.false()
      this.inst.can('dogbox', this.users.mark).must.be.false()
    },

    'resource accessible to single user': function *() {
      this.inst.can('catbox', this.users.admin).must.be.true()
      this.inst.can('catbox', this.users.john).must.be.true()
      this.inst.can('catbox', this.users.mark).must.be.false()
    },

    'resource accessible to a role': function *() {
      this.inst.can('jokerbox', this.users.admin).must.be.true()
      this.inst.can('jokerbox', this.users.john).must.be.true()
      this.inst.can('jokerbox', this.users.mark).must.be.false()
    },

    'assertions': {
      'pass': function *() {
        this.inst.assert('jokerbox', this.users.john)
      },

      'fail': function *() {
        expect(() => {
          this.inst.assert('jokerbox', this.users.mark)
        }).to.throw(`User ${this.users.mark.id} does not have permission to access: jokerbox`)
      },
    },
  },
  'can reload': function *() {
    this.inst = yield this.acl.init(this.App)

    yield this.inst.reload()
  },
  'watches for changes and reloads': function *() {
    this.inst = yield this.acl.init(this.App)

    const user = yield this.App.users.register({
      username: 'tester',
      roles: ['test'],
    })

    this.inst.can('admin', user).must.be.false()

    const spy = this.mocker.spy(this.inst, 'reload')

    const model = yield this.App.db.model('Acl')

    yield model.insert({
      resource: 'admin',
      entityType: 'role',
      entity: 'test'
    })

    yield Q.delay(100)

    spy.calledOnce.must.be.true()

    this.inst.can('admin', user).must.be.true()
  },
}
