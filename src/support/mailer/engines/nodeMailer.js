"use strict";

/**
 * @fileOverview Nodemailer engine.
 */

const nodemailer = require('nodemailer'),
  htmlToText = require('nodemailer-html-to-text').htmlToText;


const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('support/promise'),
  errors = waigo.load('support/errors');


const NodeMailerError = exports.NodeMailerError = 
  errors.define('NodeMailerError');



class NodeMailer {
  constructor (logger, config, transportImpl) {
    this.logger = logger;
    this._transport = nodemailer.createTransport(transportImpl);
    this._transport.use('compile', htmlToText());
    this._send = Q.promisify(this._transport.sendMail, {
      context: this._transport
    });
  }

  /**
   * Send an email.
   */
  * send (params) {
    if (!params.replyTo) {
      params.replyTo = params.from;
    }

    this.logger.debug('send', params);

    var noBody = _.isEmpty(params.html) && _.isEmpty(params.text);

    if (noBody || _.isEmpty(params.from) || _.isEmpty(params.to)) {
      throw new NodeMailerError('Need from, to and html/text');
    }

    return yield this._send(params);
  }
}


exports.NodeMailer = NodeMailer;

