

/**
 * @fileOverview
 *
 * Notify admins about user stats:
 * - users signed up in past 7 days
 */

const  moment = require('moment')


exports.schedule = '0 0 3 * * 1'   // every monday morning at 3am


exports.handler = function *(App) {
  // get admins
  const admins = yield App.models.User.findAdminUsers()

  if (!admins.length) {
    return
  }

  // get users recently registered
  const lastWeek = moment().add('days', -7)

  const users = yield App.models.User.getUsersCreatedSince(
    lastWeek.toDate()
  )

  yield App.mailer.send({
    to: admins,
    subject: 'Report - user signups during past 7 days',
    bodyTemplate: 'reportUserSignups',
    templateVars: {
      from: lastWeek.format('MMMM DD, YYYY'),
      to: moment().format('MMMM DD, YYYY'),
      users: users,
    }
  })
}
