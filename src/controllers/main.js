var waigo = GLOBAL.waigo,
  Controller = waigo.load('support.controller').Controller,
  util = require('util');


/**
 * Constructor.
 * @constructor
 */
var IndexController = function(app, viewFolder) {
  Controller.call(this, app, viewFolder);
};
util.inherits(IndexController, Controller);


/**
 * Default path handler.
 */
IndexController.prototype.index = function(req, res) {
  res.render('index');
};



exports.Controller = IndexController;