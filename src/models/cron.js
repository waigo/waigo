"use strict";

const co = require('co'),
  CronJob = require('cron').CronJob;

const waigo = global.waigo,
  _ = waigo._,
  viewObjects = waigo.load('support/viewObjects');


const $EXTRA = Symbol('cron extra data');



const LastRunSchema = {
  when: {
    type: Date,
    required: true,
  },
  by: {
    type: String,
    required: true,
  },
};


module.exports = {
  schema: {
    name: { 
      type: String, 
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true,
    },
    lastRun: {
      type: LastRunSchema,
      required: false,
    },
  },
  indexes: [
    {
      fields: {
        name: 1
      }, 
      options: {
        unique: true
      }
    },
  ],
  admin: {
    listView: ['name', 'disabled', 'lastRun']
  },
  methods: {
    /**
     * Create a cron task.
     *
     * This will create a new `Cron` and save it to the db (if it isn't 
     * already saved).
     * 
     * @param  {String} name     Unique name for job.
     * @param  {String} crontab Crontab spec.
     * @param  {Function} handler  The job handler.
     * 
     * @return {Cron} new Cron instance.
     */
    create: function*(name, crontab, handler) {
      let cron = yield this.findOne({
        name: name
      });

      if (!cron) {
        let cron = yield this.insert({
          name: name,
          disabled: false,
        });
      }

      cron[$EXTRA] = {
        logger: this.getApp().logger.create('Cron:' + name + ':' + process.pid),
        handler: handler,
      };

      // start the cron job
      cron.startScheduler(crontab);

      // override view object method
      cron[viewObject.METHOD_NAME] = function*(ctx) {
        let json = this.toJSON();

        json.schedule = crontab;
        json.nextRun = cron[$EXTRA].job.nextDate().toDate();

        return json;
      };

      return cron;
    },
  },
  docMethods: {
    /**
     * Start the cron scheduler for this job.
     */
    startScheduler: function(crontab) {
      let _config = this[$EXTRA];
      
      _config.logger.info('Setting up cron schedule ' + crontab);

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
        // reload data
        yield this.reload();

        // if disabled then don't run
        if (this.disabled) {
          return _config.logger.info('Task inactive, skipping run');
        }

        /*
        If another worker process beats us to the punch then we don't want to 
        repeat their work.
         */
        
        // first we check to see that it wasn't run recently
        let timeSinceLastRunMs = Date.now() - 
          (this.lastRun ? this.lastRun.when.getTime() : 0);

        if (timeSinceLastRunMs < _config.timeBetweenRunsMs) {
          return _config.logger.info('Task already ran recently, skipping');
        }

        // try updating doc (with update guard)
        let result = yield this.__col.update({
          _id: this._id,
          'lastRun.when': _.get(this.lastRun, 'when'),
          'lastRun.by': _.get(this.lastRun, 'by'),
        }, {
          $set: {
            lastRun: {
              when: new Date(),
              by: 'worker ' + process.pid
            }            
          }
        });

        // if another worker process already updated prior to us then  don't repeat that work. 
        if (0 == result) {
          return _config.logger.info('Task already in progress, skipping');
        }

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

      let runByUser = _.get(ctx, 'currentUser._id', '');

      _config.logger.debug('Running task (user: ' + runByUser + ')');

      try {
        let start = Date.now();

        yield _config.handler(this.getApp());

        let duration = Date.now() - start;

        _config.logger.info('Run complete: ' + duration + ' ms');

        yield this.record('run_pass', 'cron', {
          task: this.name,
          duration: duration,
          by: runByUser
        });

      } catch (err) {
        yield this.record('run_fail', 'cron', {
          task: this.name,
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

      _config.logger.debug('Set active: ' + active);

      this.disabled = !active;

      yield this.save();
    },
  },
};

