const _ = require('lodash'),
  path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['activities'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: ['db', 'users'],
      shutdownSteps: ['db'],
    })

    yield this.clearDb('User', 'Activity')

    this.user = yield this.App.users.register({
      username: 'test',
    })

    this.inst = yield this.waigo.load('activities').init(this.App)
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'record - user': function *() {
    yield this.inst.record('verb1', this.user, {
      dummy: true
    })

    const activities = yield this.inst.dbModel.rawQry().run()

    _.get(activities, '0.verb').must.eql('verb1')
    _.get(activities, '0.actor.id').must.eql(this.user.id)
    _.get(activities, '0.actor.displayName').must.eql('test')
    _.get(activities, '0.details').must.eql({dummy: true})
  },
  'record - string': function *() {
    yield this.inst.record('verb1', 'system', {
      dummy: true
    })

    const activities = yield this.inst.dbModel.rawQry().run()

    _.get(activities, '0.verb').must.eql('verb1')
    _.get(activities, '0.actor.id').must.eql('system')
    _.get(activities, '0.actor.displayName').must.eql('')
    _.get(activities, '0.details').must.eql({dummy: true})
  },
  'getLatest': function *() {
    yield this.inst.record('verb1', 'system', {
      dummy: true
    })

    yield this.inst.record('verb1', 'system', {
      dummy: 23
    })

    const activity = yield this.inst.getLatest({
      verb: 'verb1',
      actor: {
        id: 'system'
      }
    })

    expect(activity.details).to.eql({ dummy: 23 })
  },
}
