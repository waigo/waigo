"use strict";

const Slack = require('slack-node');

const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('support/promise');



module.exports = function*(app, id, config) {
  logger = app.logger.create(`SlackNotifier[${id}]`);

  let slack = new Slack();

  slack.setWebhook(config.url);

  return function*(messageOrObject) {
    let msg = (typeof messageOrObject === 'string' ? messageOrObject : JSON.stringify(messageOrObject));
    
    logger.debug(`Notify`);

    return new Q(function(resolve, reject) {
      slack.webhook({
        channel: config.channel,
        username: config.username,
        icon_emoji: config.icon_emoji,
        text: msg,
      }, function(err, response) {
        if (err) {
          logger.error(err);

          return reject(new Error('' + err));
        } else {
          resolve();
        }
      });
    });
  };
};


