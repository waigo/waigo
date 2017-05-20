const path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['action tokens'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: ['db', 'activities', 'users']
    })

    yield this.clearDb('User', 'Activity')

    this.users = yield {
      john: this.App.users.register({
        username: 'john'
      }),
      mark: this.App.users.register({
        username: 'mark',
      }),
    }

    this.inst = yield this.waigo.load('actionTokens').init(this.App, {
      validForSeconds: 2,
      encryptionKey: 'test',
    })
  },
  afterEach: function *() {
    yield this.shutdownApp()
  },
  'default - create and process': function *() {
    const token = yield this.inst.create('confirm', this.users.john, {
      dummy: true,
    })

    expect(token).to.be.a.string()

    const ret = yield this.inst.process(token)

    ret.type.must.eql('confirm')
    ret.user.id.must.eql(this.users.john.id)
    ret.data.must.eql({dummy: true})
  },
  'records activity': function *() {
    const token = yield this.inst.create('confirm', this.users.john, {
      dummy: true,
    })

    yield this.inst.process(token)

    const activity = yield this.App.activities.getLatest({
      verb: 'action_token_processed',
      actor: {
        id: this.users.john.id
      }
    })

    expect(activity).to.exist()
    expect(activity.details.type).to.eql('confirm')
  },
  'override validity period': function *() {
    const token = yield this.inst.create('confirm', this.users.john, {
      dummy: true,
    }, {
      validForSeconds: 0,
    })

    yield Q.delay(10)

    yield this.mustThrow(this.inst.process(token), 'This request has expired')
  },
  'when got token': {
    beforeEach: function *() {
      this.token = yield this.inst.create('confirm', this.users.john)
    },

    'parse error': function *() {
      this.token += 'a'

      yield this.mustThrow(this.inst.process(this.token), 'Error parsing request token')
    },

    'type mismatch': function *() {
      yield this.mustThrow(
        this.inst.process(this.token, {
          type: 'blah'
        }),
        'Request type mismatch: confirm'
      )
    },

    'expired': function *() {
      yield Q.delay(2001)

      yield this.mustThrow(this.inst.process(this.token), 'This request has expired')
    },

    'user not found': function *() {
      yield this.clearDb('User')

      yield this.mustThrow(this.inst.process(this.token), 'Unable to find user information related to this request')
    },

    'already processed': function *() {
      yield this.inst.process(this.token)

      yield this.mustThrow(this.inst.process(this.token), 'This request has already been processed and is no longer valid')
    },
  },
}
