"use strict";

/** 
 * @fileOverview Console mailer - prints emails to console.
 */

const nodemailerStubTransport = require('nodemailer-stub-transport');

const waigo = global.waigo,
  _ = waigo._,
  Mailer = waigo.load('support/mailer/base').Mailer;



class Console extends Mailer {
  constructor(app, config) {
    super(app, config, 'console');
  }

  * send (params) {
    let result = yield this._send(options);

    this.logger.info(result);
  }

}


exports.Console = Console;



exports.create = function*(app, config) {
  var c = new Console(app, config);
  
  yield c._init(nodemailerStubTransport());

  return c;
};




