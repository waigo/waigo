"use strict";

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('ConsoleNotifier');



module.exports = function*(app, id, config) {
  let _logger = logger.create(id);

  return function*(messageOrObject) {
    let msg = (typeof messageOrObject === 'string' ? messageOrObject : JSON.stringify(messageOrObject));
    
    _logger.info(msg);
  };
};


