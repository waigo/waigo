"use strict";

/**
 * @fileOverview Setup app-level convenient accessors and template helpers
 */


var waigo = require('../../../'),
  _ = waigo._;


module.exports = function*(app) {
  // Form
  app.form = waigo.load('support/forms/form');
  // template helpers
  app.locals = {
    _: _,
  };
};




