"use strict";

/** 
 * @fileOverview Base class for mailer types.
 */

var debug = require('debug')('waigo-mailer-base');


var waigo = require('../../../'),
  _ = waigo._,
  errors = waigo.load('support/errors'),
  NodeMailer = waigo.load('support/mailers/utils/nodeMailer').NodeMailer;


var MailerError = errors.define('MailerError');



var Mailer = exports.Mailer = function(app, config, logger) {
  this.app = app;
  this.logger = logger;
  this.config = config;
};


Mailer.prototype._initNodeMailer = function*(transport) {
  this._nodeMailer = new NodeMailer(this.logger, this.config, transport);
};



Mailer.prototype._send = function*(mailOptions) {
  var self = this;

  mailOptions = _.extend({
    from: this.config.from,
    subject: null,
    body: null,
    locals: {},
    ctx: {},
  }, mailOptions);


  if (_.isEmpty(mailOptions.subject) || _.isEmpty(mailOptions.body)) {
    throw new MailerError('Subject and body must be set');
  }

  // locals common to all recipients
  var commonLocals = _.extend({}, app.locals, mailOptions.ctx.locals, 
    yield viewObjects.toViewObjectYieldable(mailOptions.ctx, mailOptions.locals)
  );

  return yield _.map(to, function(recipient) {
    // email address
    var email = _.get(recipient, 'emails.0.email', recipient);

    self.logger.debug(`Email ${email}: ${subjectTemplate}`);

    // user-specific locals
    var userLocals = _.extend({}, commonLocals, 
      yield viewObjects.toViewObjectYieldable(mailOptions.ctx, {
        recipient: recipient
      })
    });

    // render body
    var body = yield self._renderEmailTemplate('user', userLocals);

    // setup actual options
    var sendOptions = _.extend({
      mailOptions.from,
    }, {
      to: email,
      subject: strtpl(subjectTemplate, userLocals),
      html: body.html,
      text: body.text || null,
    });

    self.logger.debug('Content', body.html);

    // send
    return yield self._nodeMailer.send(sendOptions);
  });
};


