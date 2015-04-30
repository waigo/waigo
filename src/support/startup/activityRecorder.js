"use strict";

var debug = require('debug')('waigo-startup-activities'),
  waigo = require('../../../'),
  _ = waigo._;



/**
 * Setup activity recorder for the app.
 *
 * This allows you to record activities to the `Activities` model.
 * 
 * This should be preceded by startup: `models`.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Setting up Activity recorder');

  /**
   * Record an activity.
   * 
   * @param {String} verb          activity name
   * @param {String|User} actor         `User` who did it. Or name of system process.
   * @param {Object} [details]       Additional details.
   * 
   * @return {Activity} the created activity object
   */
  app.record = function*(verb, actor, details) {
    app.logger.debug('Recording activity', verb, actor, details);

    if (!actor._id) {
      actor = {
        displayName: actor
      }
    } else {
      actor = {
        _id: '' + actor._id,
        displayName: actor.username,
      }
    }

    return yield app.models.Activity.insert({
      verb: verb,
      actor: actor,
      published: new Date(),
      details: details || null
    });
  };
};

