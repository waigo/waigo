/**
 * @fileOverview
 *
 * Cron manager
 */

const co = require('co'),
  CronJob = require('cron').CronJob

const waigo = global.waigo,
  _ = waigo._,
  viewObjects = waigo.load('viewObjects')


const $EXTRA = Symbol('cron extra data')

/**
 * Singleton instance.
 * @type {Object}
 */
let cronMgr


const modelSpec = {
  docMethods: {
    /**
     * Start the cron scheduler for this job.
     */
    startScheduler: function (crontab) {
      const _config = this[$EXTRA]

      _config.logger.info(`Setting up cron schedule ${crontab}`)

      _config.job = new CronJob({
        cronTime: crontab,
        onTick: _.bind(co.wrap(this._cronCallback), this),
        start: true,
      })

      // calculate and save time between runs
      // we add 1 second to next date otherwise, _getNextDateFrom() returns
      // the same date back
      const nextRunDate = _config.job.nextDate().add(1, 'seconds')

      _config.timeBetweenRunsMs =
        _config.job.cronTime._getNextDateFrom(nextRunDate).valueOf() - nextRunDate.valueOf()
    },
    /**
     * Stop the cron scheduler for this job.
     */
    stopScheduler: function () {
      const _config = this[$EXTRA]

      _config.logger.info(`Stopping cron scheduler`)

      if (_config.job) {
        _config.job.stop()
      }
    },
    /**
     * Callback for cron job when task needs to run.
     */
    _cronCallback: function *() {
      const _config = this[$EXTRA]

      _config.logger.info('Starting scheduled run')

      try {
        // always reload data at the start in case other app instances have
        // executed the task recently
        const dbData = yield cronMgr.dbModel.get(this.id)

        // if disabled then don't run
        if (dbData.disabled) {
          return _config.logger.info('Task inactive, skipping run')
        }

        /*
        If another worker process beats us to the punch then we don't want to
        repeat their work.
        */

        // first we check to see that it wasn't run recently
        const timeSinceLastRunMs = Date.now() -
          (dbData.lastRun ? dbData.lastRun.when.getTime() : 0)

        if (timeSinceLastRunMs < _config.timeBetweenRunsMs) {
          return _config.logger.info('Task already ran recently, skipping')
        }

        this.lastRun = {
          when: new Date(),
          by: `worker ${process.pid}`,
        }

        yield this.save()

        yield this.runNow()
      } catch (err) {
        _config.logger.error('Scheduled run error', err.stack)
      }
    },
    /**
     * Run this task.
     *
     * This will run this task even if it's not active.
     *
     * @param {Object} [ctx] Request context (if available).
     */
    runNow: function *(ctx) {
      const _config = this[$EXTRA]

      const runByUser = _.get(ctx, 'currentUser.id', '')

      _config.logger.debug(`Running task (user: ${runByUser})`)

      try {
        const start = Date.now()

        yield _config.handler(this._App())

        const duration = Date.now() - start

        _config.logger.info(`Run complete: ${duration}ms`)

        cronMgr.App.emit('record', 'run_pass', 'cron', {
          task: this.id,
          duration: duration,
          by: runByUser
        })
      } catch (err) {
        cronMgr.App.emit('record', 'run_fail', 'cron', {
          task: this.id,
          err: err.stack,
          by: runByUser
        })

        throw err
      }
    },
    /**
     * Set schedule status of this task.
     */
    setActive: function *(active) {
      const _config = this[$EXTRA]

      _config.logger.debug(`Set active: ${active}`)

      this.disabled = !active

      yield this.save()
    }
  }
}


class Cron {
  /**
   * @constructor
   * @param  {Application} App The Waigo app.
   */
  constructor (App) {
    this.App = App
    this.logger = App.logger.create('Cron')

    this.jobs = {}
  }

  /**
   * Initialize.
   */
  *init () {
    this.dbModel = yield this.App.db.model('cron', modelSpec)
  }


  /**
   * Destroy
   */
  *destroy () {
    this.logger.info('Stopping jobs')

    yield _.map(this.job, (job) => job.stopScheduler())
  }


  /**
   * Add a cron job.
   *
   * This will create a new cron task and save it to the db, if it isn't
   * already saved.
   *
   * @param  {String} id Unique id for job.
   * @param  {Object} config Config for the job.
   * @param  {String} config.schedule Crontab spec.
   * @param  {Function} config.handler  The job handler.
   */
  *addJob (id, config) {
    const { schedule, handler } = config

    let cron = yield this.dbModel.get(id)

    if (!cron) {
      cron = yield this.dbModel.insert({
        id,
        disabled: false,
      })
    }

    cron[$EXTRA] = {
      logger: this.logger.create(id),
      handler,
    }

    // start the cron job
    cron.startScheduler(schedule)

    // override view object method
    cron[viewObjects.METHOD_NAME] = function *(ctx) {
      const json = {
        id: this.id,
        disabled: this.disabled,
        lastRun: this.lastRun ? this.lastRun.when : 'never',
      }

      json.schedule = schedule
      json.nextRun = cron[$EXTRA].job.nextDate().toDate()

      return json
    }

    this.jobs[id] = cron
  }

  get (id) {
    return this.jobs[id]
  }
}


/**
 * Initialise Cron manager.
 *
 * @param  {Object} App Application object.
 * @return {Object} Cron manager.
 */
exports.init = function *(App) {
  if (!cronMgr) {
    cronMgr = new Cron(App)

    yield cronMgr.init()
  }

  return cronMgr
}
