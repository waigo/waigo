"use strict";

const waigo = global.waigo,
  Q = waigo.load('support/promise'),
  errors = waigo.load('support/errors'),
  viewObjects = waigo.load('support/viewObjects'),
  Document = waigo.load('support/models/document'),
  RethinkDbModel = waigo.load('support/models/model').RethinkDbModel,
  adminConfig = waigo.load('models/cron/adminConfig'),
  tableDef = waigo.load('models/cron/tableDef'),
  docMethods = waigo.load('models/cron/docMethods'),
  $EXTRA = waigo.load('models/cron/symbols').$EXTRA;







class Model extends RethinkDbModel {
  constructor (app) {
    super(app, app.db, {
      name: "Cron",
      schema: tableDef.schema,
      indexes: tableDef.indexes,
      adminConfig: adminConfig,
      docMethods: docMethods,
    });
  }

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
  * create (id, crontab, handler) {
    let cron = yield this._get(id);

    if (!cron) {
      cron = yield this._insert({
        id: id,
        disabled: false,
      });
    }

    cron[$EXTRA] = {
      logger: this.app.logger.create(`Cron: ${id}: ${process.pid}`),
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
  }

}




module.exports = Model;
