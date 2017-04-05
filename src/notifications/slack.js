const Slack = require('slack-node')

const waigo = global.waigo,
  logger = waigo.load('logger').create('SlackNotifier'),
  Q = waigo.load('promise')



module.exports = function *(App, id, config) {
  const _logger = logger.create(id)

  const slack = new Slack()

  slack.setWebhook(config.url)

  return function *(messageOrObject) {
    const msg = (typeof messageOrObject === 'string' ? messageOrObject : JSON.stringify(messageOrObject))

    _logger.debug(`Notify`)

    yield new Q(function (resolve, reject) {
      slack.webhook({
        channel: config.channel,
        username: config.username,
        icon_emoji: config.icon_emoji,
        text: msg,
      }, function (err, response) {
        if (err) {
          _logger.error(err)

          return reject(new Error('' + err))
        } else {
          resolve()
        }
      })
    })
  }
}
