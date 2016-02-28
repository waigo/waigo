"use strict";

const waigo = global.waigo,
  _ = waigo._;



module.exports = function*(app, id, config) {
  let logger = app.logger.create(`ConsoleNotifier[${id}]`);

  return function*(messageOrObject) {
    let msg = (typeof messageOrObject === 'string' ? messageOrObject : JSON.stringify(messageOrObject));
    
    logger.info(msg);
  };
};


