"use strict";

/**
 * @fileOverview Setup form stuff.
 */


var waigo = require('../../../'),
  _ = waigo._;


module.exports = function*(app) {
  // Form
  app.form = waigo.load('support/forms/form');
};




