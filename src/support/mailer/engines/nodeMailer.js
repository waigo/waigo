"use strict";

/**
 * @fileOverview Nodemailer engine.
 */

var debug = require('debug')('waigo-mailer-base'),
  nodemailer = require('nodemailer'),
  htmlToText = require('nodemailer-html-to-text').htmlToText,
  Q = require('bluebird');


var waigo = global.waigo,
  _ = waigo._;


var NodeMailerError = exports.NodeMailerError = 
  waigo.load('support/errors').define('NodeMailerError');


/**
 * @constructor
 */
var NodeMailer = exports.NodeMailer = function(logger, config, transportImpl) {
  this.logger = logger;
  this._transport = nodemailer.createTransport(transportImpl);
  this._transport.use('compile', htmlToText());
  this._send = Q.promisify(this._transport.sendMail, this._transport);
};



/** 
 * Send an email.
 */
NodeMailer.prototype.send = function*(mailOptions) {
  if (!mailOptions.replyTo) {
    mailOptions.replyTo = mailOptions.from;
  }

  this.logger.debug('send', mailOptions);

  var noBody = _.isEmpty(mailOptions.html) && _.isEmpty(mailOptions.text);

  if (noBody || _.isEmpty(mailOptions.from) || _.isEmpty(mailOptions.to)) {
    throw new NodeMailerError('Need from, to and html/text');
  }

  return yield this._send(mailOptions);
};



