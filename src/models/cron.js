"use strict";

const co = require('co'),
  CronJob = require('cron').CronJob;

const waigo = global.waigo,
  _ = waigo._,
  viewObjects = waigo.load('support/viewObjects');


const $EXTRA = Symbol('cron extra data');



function buildModelMethods(app) {
  return {
    /**
     * Create a cron task.
     *
     * This will create a new `Cron` and save it to the db (if it isn't 
     * already saved).
     * 
     * @param  {String} id Unique id for job.
     * @param  {String} crontab Crontab spec.
     * @param  {Function} handler  The job handler.
     * 
     * @return {Cron} new cron task instance.
     */
    'create': function*(id, crontab, handler) {
      let cron = null;

      try {
        cron = yield this.get(id).run();
      } catch (err) {
        cron = yield this.save({
          id: id,
          disabled: false,
        });
      }

      cron[$EXTRA] = {
        logger: app.logger.create(`Cron: ${id}: ${process.pid}`),
        handler: handler,
      };

      // start the cron job
      cron.startScheduler(crontab);

      // override view object method
      cron[viewObjects.METHOD_NAME] = function*(ctx) {
        let json = {
          id: this.id,
          disabled: this.disabled,
          lastRun: this.lastRun ? this.lastRun.when : 'never',
        };

        json.schedule = crontab;
        json.nextRun = cron[$EXTRA].job.nextDate().toDate();

        return json;
      };

      return cron;
    },
  }
}


function buildDocMethods(app) {
  return {
    /**
     * Start the cron scheduler for this job.
     */
    startScheduler: function(crontab) {
      let _config = this[$EXTRA];
      
      _config.logger.info(`Setting up cron schedule ${crontab}`);

      _config.job = new CronJob({
        cronTime: crontab,
        onTick: _.bind(co.wrap(this._cronCallback), this),
        start: true,
      });

      /* calculate and save time between runs */
      
      // we add 1 second to next date otherwise, _getNextDateFrom() returns 
      // the same date back
      let nextRunDate = _config.job.nextDate().add(1, 'seconds');

      _config.timeBetweenRunsMs = 
        _config.job.cronTime._getNextDateFrom(nextRunDate).valueOf() - nextRunDate.valueOf();
    },
    /**
     * Callback for cron job when task needs to run.
     * @return {[type]} [description]
     */
    _cronCallback: function*() {
      let _config = this[$EXTRA];

      _config.logger.info('Starting scheduled run');

      try {
        // always reload data at the start in case other app instances have 
        // executed the task recently
        let dbData = yield this.getModel().get(this.id);

        // if disabled then don't run
        if (dbData.disabled) {
          return _config.logger.info('Task inactive, skipping run');
        }

        /*
        If another worker process beats us to the punch then we don't want to 
        repeat their work.
         */
        
        // first we check to see that it wasn't run recently
        let timeSinceLastRunMs = Date.now() - 
          (dbData.lastRun ? dbData.lastRun.when.getTime() : 0);

        if (timeSinceLastRunMs < _config.timeBetweenRunsMs) {
          return _config.logger.info('Task already ran recently, skipping');
        }

        this.lastRun = {
          when: new Date(),
          by: `worker ${process.pid}`,
        };
        yield this.save();

        yield this.runNow();

      } catch (err) {
        _config.logger.error('Scheduled run error', err.stack);
      }
    },
    /**
     * Run this task.
     *
     * This will run this task even if it's not active.
     *
     * @param {Object} [ctx] Request context (if available).
     */
    runNow: function*(ctx) {
      let _config = this[$EXTRA];

      let runByUser = _.get(ctx, 'currentUser.id', '');

      _config.logger.debug(`Running task (user: ${runByUser})`);

      try {
        let start = Date.now();

        yield _config.handler(this.getApp());

        let duration = Date.now() - start;

        _config.logger.info(`Run complete: ${duration}ms`);

        yield this.record('run_pass', 'cron', {
          task: this.id,
          duration: duration,
          by: runByUser
        });

      } catch (err) {
        yield this.record('run_fail', 'cron', {
          task: this.id,
          err: err.stack,
          by: runByUser
        });

        throw err;
      }
    },
    /**
     * Set schedule status of this task.
     */
    setActive: function*(active) {
      let _config = this[$EXTRA];

      _config.logger.debug(`Set active: ${active}`);

      this.disabled = !active;

      yield this.save();
    },
  }
}



module.exports = function(app) {
  const db = app.db;

  const Cron = db.createModel("Cron", {
    disabled: db.type.boolean().required(),
    lastRun: db.type.object().optional().schema({
      type: db.type.string().required(),
      when: db.type.date().required(),
    }),
  }, {
    enforce_missing: true
  });


  Cron.admin = {
    listView: ['id', 'disabled', 'lastRun.when'],
  };

  _.each(buildModelMethods(app), function(fn, k) {
    Cron[k] = _.bind(fn, Cron);
  });

  _.each(buildDocMethods(app), function(fn, k) {
    Cron.define(k, fn);
  });

  return Cron;
};

