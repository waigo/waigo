"use strict";

/** 
 * @fileOverview Console mailer - prints emails to console.
 */

var util = require('util'),
  nodemailerStubTransport = require('nodemailer-stub-transport');

var waigo = require('../../../');


var NodeMailer = waigo.load('support/mailers/utils/nodeMailer').NodeMailer;



var Console = function() {};
util.inherits(Console, Mailer);



exports.create = function*(app, config) {
  var logger = app.logger.create('ConsoleMailer');

  nodeMailer = new NodeMailer(logger, config, nodemailerStubTransport());

  return m;

  Consoler.super_.prototype.init.call(this, config);

  var transport = nodemailer.createTransport(
    nodemailerStubTransport()
  );
  transport.use('compile', htmlToText());

  let sendMail = Q.promisify(transport.sendMail, transport);
};



Console.prototype.