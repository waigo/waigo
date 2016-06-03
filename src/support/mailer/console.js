"use strict";

/** 
 * @fileOverview Console mailer - prints emails to console.
 */

const nodemailerStubTransport = require('nodemailer-stub-transport');

const waigo = global.waigo,
  _ = waigo._,
  Mailer = waigo.load('support/mailer/base');



class Console extends Mailer {
  constructor(App, config) {
    super(App, config, 'console');
  }

  * send (params) {
    return yield this._send(params);
  }

}


exports.Console = Console;



exports.create = function*(App, config) {
  var c = new Console(App, config);
  
  yield c._init(nodemailerStubTransport());

  return c;
};




