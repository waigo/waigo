var waigo = GLOBAL.waigo,
  Controller = waigo.load('support.controller'),
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
  res.render('index', {
    text: 'Hello World!'
  });
};



exports.Controller = IndexController;