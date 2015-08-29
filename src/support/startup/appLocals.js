"use strict";

/**
 * @fileOverview Setup app locals (for use in templates)
 */


var waigo = require('../../../'),
  _ = waigo._;


module.exports = function*(app) {
  // template helpers
  app.locals = {
    _: _,
  };
};




