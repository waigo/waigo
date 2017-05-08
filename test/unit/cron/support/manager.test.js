const path = require('path'),
  moment = require('moment'),
  Q = require('bluebird')


const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['cron manager'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: ['db']
    })

    yield this.clearDb('Cron')

    this.inst = yield this.waigo.load('cron/support/manager').init(this.App)

    this.viewObjects = this.waigo.load('viewObjects')
  },

  afterEach: function *() {
    yield this.inst.destroy()

    yield this.shutdownApp()
  },

  'add new job': function *() {
    const ret = []

    yield this.inst.addJob('sample', {
      schedule: '* * * * * *',
      handler: function *(App) {
        ret.push(1)
      }
    })

    yield Q.delay(3000)

    expect(1 <= ret.length).to.be.true()
  },

  'adds to db': function *() {
    yield this.inst.addJob('sample', {
      schedule: '0 0 3 * * 1',
      handler: function *(App) {}
    })

    const dbJob = yield this.inst.dbModel.get('sample')

    expect(dbJob).to.exist()
    expect(dbJob.disabled).to.be.false()
    expect(dbJob.lastRun).to.be.undefined()
  },

  'already in db': function *() {
    yield this.inst.addJob('sample', {
      schedule: '0 0 3 * * 1',
      handler: function *(App) {}
    })

    const ret = []

    yield this.inst.addJob('sample', {
      schedule: '* * * * * *',
      handler: function *(App) {
        ret.push(1)
      }
    })

    yield Q.delay(3000)

    const numJobs = yield this.inst.dbModel.rawQry().count().run()

    expect(numJobs).to.eql(1)

    expect(1 <= ret.length).to.be.true()
  },

  'view object': function *() {
    yield this.inst.addJob('sample', {
      schedule: '0 0 3 * * 1',
      handler: function *(App) {}
    })

    const job = this.inst.get('sample')

    const json = yield job[this.viewObjects.METHOD_NAME]()

    expect(json).to.exist()
    expect(json.id).to.eql('sample')
    expect(json.disabled).to.be.false()
    expect(json.lastRun).to.eql('never')
    expect(json.schedule).to.eql('0 0 3 * * 1')
    expect(json.nextRun.getTime()).to.be.gt(Date.now())
  },

  'records last run time': function *() {
    const genesisTime = Date.now()

    yield this.inst.addJob('sample', {
      schedule: '* * * * * *',
      handler: function *(App) {}
    })

    yield Q.delay(1500)

    let dbJob = yield this.inst.dbModel.get('sample')

    expect(dbJob).to.exist()
    expect(dbJob.lastRun.when.getTime()).to.be.gt(genesisTime)
    expect(dbJob.lastRun.by).to.eql(`worker ${process.pid}`)

    const lastRun = dbJob.lastRun.when.getTime()

    yield Q.delay(1500)

    dbJob = yield this.inst.dbModel.get('sample')

    expect(dbJob.lastRun.when.getTime()).to.be.gt(lastRun)
  },

  'manual runs do not affect last run time': function *() {
    yield this.inst.addJob('sample', {
      schedule: '0 0 3 * * 1',
      handler: function *(App) {}
    })

    const job = this.inst.get('sample')

    yield job.runNow()

    let dbJob = yield this.inst.dbModel.get('sample')

    expect(dbJob).to.exist()
    expect(dbJob.lastRun).to.be.undefined()
  },

  'can disable': function *() {
    const ret = []

    yield this.inst.addJob('sample', {
      schedule: '* * * * * *',
      handler: function *(App) {
        ret.push(1)
      }
    })

    const job = this.inst.get('sample')

    yield Q.delay(1500)

    yield job.setActive(false)

    expect(ret.length).to.be.gt(0)

    const lastLength = ret.length

    yield Q.delay(1500)

    expect(ret.length).to.eql(lastLength)

    yield job.setActive(true)

    yield Q.delay(1500)

    expect(ret.length).to.be.gt(lastLength)
  },

  'strictly controls when it is automatically run': function *() {
    const ret = []

    yield this.inst.addJob('sample', {
      schedule: '0 0 3 * * 1',
      handler: function *(App) {
        ret.push(1)
      }
    })

    const job = this.inst.get('sample')

    // simulate auto-run
    yield job._cronCallback()

    let dbJob = yield this.inst.dbModel.get('sample')

    expect(dbJob).to.exist()
    expect(dbJob.lastRun.when).to.exist()

    const lastRun = dbJob.lastRun.when

    yield job._cronCallback()

    // expect it didn't get run again
    dbJob = yield this.inst.dbModel.get('sample')
    expect(dbJob.lastRun.when).to.eql(lastRun)

    // now wait over a week
    dbJob.lastRun.when = moment().subtract(-1, 'week').toDate()
    dbJob.markChanged('lastRun')
    yield dbJob.save()

    yield job._cronCallback()

    // expect it did get run again
    dbJob = yield this.inst.dbModel.get('sample')
    expect(dbJob.lastRun.when).to.be.gt(lastRun)
  },

  'records event': {
    beforeEach: function *() {
      this.recorderArgs = []

      this.recorder = (status, actor, details) => {
        this.recorderArgs.push({
          status,
          actor,
          details
        })
      }

      this.App.on('record', this.recorder)
    },

    afterEach: function *() {
      this.App.off('record', this.recorder)
    },

    'pass': function *() {
      yield this.inst.addJob('sample', {
        schedule: '0 0 3 * * 1',
        handler: function *(App) {}
      })

      const job = this.inst.get('sample')

      yield job.runNow()

      const activity = this.recorderArgs[0]

      expect(activity).to.exist()
      expect(activity.status).to.eql('run_pass')
      expect(activity.actor).to.eql('cron')
      expect(activity.details.task).to.eql('sample')
      expect(activity.details.duration).to.exist()
      expect(activity.details.by).to.eql('')
    },

    'pass - context user': function *() {
      yield this.inst.addJob('sample', {
        schedule: '0 0 3 * * 1',
        handler: function *(App) {}
      })

      const job = this.inst.get('sample')

      yield job.runNow({
        currentUser: {
          id: 'test'
        }
      })

      const activity = this.recorderArgs[0]

      expect(activity).to.exist()
      expect(activity.details.by).to.eql('test')
    },

    'fail': function *() {
      yield this.inst.addJob('sample', {
        schedule: '0 0 3 * * 1',
        handler: function *(App) {
          throw new Error('blah')
        }
      })

      const job = this.inst.get('sample')

      try {
        yield job.runNow()
      } catch (err) {}

      const activity = this.recorderArgs[0]

      expect(activity).to.exist()
      expect(activity.status).to.eql('run_fail')
      expect(activity.actor).to.eql('cron')
      expect(activity.details.task).to.eql('sample')
      expect(activity.details.err).to.exist()
      expect(activity.details.by).to.eql('')
    },
  }

}
