"use strict";

/**
 * @fileOverview
 *
 * Email admins some user stats:
 * - users signed up in past 7 days
 */

let  moment = require('moment');


exports.schedule = '0 0 3 * * 1';   // every monday morning at 3am


exports.handler = function*(app) {
  // get admins
  let  admins = yield app.models.User.findAdminUsers();

  if (!admins.length) {
    return;
  }

  let lastWeek = moment().add('days', -7);

  let activities = yield app.models.Activity.getRegistrationsSince(
    lastWeek.toDate()
  );

  let users = activities.map(function(a) {
    return a.actor;
  });

  yield app.mailer.send({
    to: admins,
    subject: 'Report - user signups during past 7 days',
    bodyTemplate: 'reportUserSignups',
    templateVars: {
      from: lastWeek.format('MMMM DD, YYYY'),
      to: moment().format('MMMM DD, YYYY'),
      users: users,
    }
  });
};
