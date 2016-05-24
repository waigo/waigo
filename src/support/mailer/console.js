"use strict";

/** 
 * @fileOverview Console mailer - prints emails to console.
 */

const nodemailerStubTransport = require('nodemailer-stub-transport');

const waigo = global.waigo,
  _ = waigo._,
  Mailer = waigo.load('support/mailer/base');



class Console extends Mailer {
  constructor(app, config) {
    super(app, config, 'console');
  }

  * send (params) {
    return yield this._send(params);
  }

}


exports.Console = Console;



exports.create = function*(app, config) {
  var c = new Console(app, config);
  
  yield c._init(nodemailerStubTransport());

  return c;
};




