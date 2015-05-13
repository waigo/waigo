"use strict";

/**
 * @fileOverview
 *
 * Email admins some user stats:
 * - users signed up in past month
 */

var moment = require('moment');



// exports.schedule = '*/10 * * * * *';
exports.schedule = '0 0 3 0 * *';   // 1st of of every month at 3am


exports.handler = function*(app) {
  var lastMonth = moment().add('months', -1);

  var activities = yield app.models.Activity.find({
    published: {
      $gte: lastMonth.date(1).toDate(),
      $lte: lastMonth.endOf('month').toDate(),
    },
    verb: 'register'
  });

  var users = activities.map(function(a) {
    return a.actor;
  });

  // get admins
  var admins = yield app.models.User.findAdminUsers();

  yield app.mailer.send({
    to: admins,
    subject: 'Report - user signups last month',
    bodyTemplate: 'reportUserSignups',
    locals: {
      month: lastMonth.format('MMMM'),
      users: users,
    }
  });
};
