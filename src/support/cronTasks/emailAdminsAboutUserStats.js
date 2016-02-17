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
  let  lastWeek = moment().add('days', -7);

  let  activities = yield app.models.Activity.find({
    published: {
      $gte: lastWeek.toDate(),
    },
    verb: 'register'
  });

  let  users = activities.map(function(a) {
    return a.actor;
  });

  // get admins
  let  admins = yield app.models.User.findAdminUsers();

  yield app.mailer.send({
    to: admins,
    subject: 'Report - user signups during past 7 days',
    bodyTemplate: 'reportUserSignups',
    locals: {
      from: lastWeek.format('MMMM DD, YYYY'),
      to: moment().format('MMMM DD, YYYY'),
      users: users,
    }
  });
};
