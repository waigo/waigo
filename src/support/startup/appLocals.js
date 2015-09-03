"use strict";

/**
 * @fileOverview Setup app locals (for use in templates)
 */


var waigo = global.waigo,
  _ = waigo._;


module.exports = function*(app) {
  // template helpers
  app.locals = {
    _: _,
  };
};




