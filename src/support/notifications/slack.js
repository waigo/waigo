"use strict";

const Slack = require('slack-node');

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('SlackNotifier'),
  Q = waigo.load('support/promise');



module.exports = function*(app, id, config) {
  let _logger = logger.create(id);

  let slack = new Slack();

  slack.setWebhook(config.url);

  return function*(messageOrObject) {
    let msg = (typeof messageOrObject === 'string' ? messageOrObject : JSON.stringify(messageOrObject));
    
    _logger.debug(`Notify`);

    yield new Q(function(resolve, reject) {
      slack.webhook({
        channel: config.channel,
        username: config.username,
        icon_emoji: config.icon_emoji,
        text: msg,
      }, function(err, response) {
        if (err) {
          _logger.error(err);

          return reject(new Error('' + err));
        } else {
          resolve();
        }
      });
    });
  };
};


