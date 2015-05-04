"use strict";

/** 
 * @fileOverview Console mailer - prints emails to console.
 */

var util = require('util'),
  nodemailerStubTransport = require('nodemailer-stub-transport');

var waigo = require('../../../'),
  _ = waigo._;


var Mailer = waigo.load('support/mailer/base').Mailer;


var Console = function(app, config) {
  Console.super_.call(this, app, config, app.logger.create('ConsoleLogger'));
};
util.inherits(Console, Mailer);




Console.prototype.send = function*(options) {
  var result = yield this._send(options);

  console.log(result);
};



exports.create = function*(app, config) {
  var c = new Console(app, config);
  
  yield c._init(nodemailerStubTransport());

  return c;
};
