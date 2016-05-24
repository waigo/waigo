"use strict";

/** 
 * @fileOverview Base class for mailer types.
 */

const co = require('co'),
  path = require('path'),
  marked = require('marked');


const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger'),
  Q = waigo.load('support/promise'),
  errors = waigo.load('support/errors'),
  NodeMailer = waigo.load('support/mailer/engines/nodeMailer').NodeMailer,
  viewObjects = waigo.load('support/viewObjects');

const EmailTemplate = require('email-templates').EmailTemplate;
const MailerError = errors.define('MailerError');


/**
 * Base mailer class.
 */
class Mailer {
  constructor (app, config, typeString) {
    this.app = app;
    this.logger = logger.create(`Mailer-${typeString}`);
    this.config = config;
  }


  * _init (transport) {
    this._nodeMailer = new NodeMailer(
      this.logger.create('NodeMailer'), 
      this.config, transport
    );
  }



  _renderEmailTemplate (templateName, templateVars) {
    this.logger.debug('Rendering template ' + templateName);

    let templatePath = 
      path.dirname( waigo.getPath(`emails/${templateName}/html.pug`) );

    let emailTemplate = new EmailTemplate(templatePath);

    return new Q((resolve, reject) => {
      emailTemplate.render(templateVars, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }



  * _renderBodyMarkdown (template, templateVars) {
    var compiled = _.template(template, {
      interpolate: /{{([\s\S]+?)}}/img
    });

    return marked(compiled(templateVars || {}));
  }


  * _renderBodyTemplate (templateName, templateVars) {
    var body = yield this._renderEmailTemplate(templateName, templateVars);

    return body.html;
  }



  * _renderBody (mailOptions, templateVars) {
    let content;

    if (mailOptions.bodyTemplate) {
      content = yield this._renderBodyTemplate(mailOptions.bodyTemplate, templateVars);
    } else {
      content = yield this._renderBodyMarkdown(mailOptions.body, templateVars);
    }

    var templateVars = _.extend({}, this.app.templateVars, templateVars, {
      content: content
    });

    var body = yield this._renderEmailTemplate('_layout', templateVars);

    return body.html;
  }



  * _renderSubject (mailOptions, templateVars) {
    var compiled = _.template(mailOptions.subject, {
      interpolate: /{{([\s\S]+?)}}/img
    });

    return compiled(templateVars || {});
  }



  * _prepareMailOptions (mailOptions) {
    mailOptions = _.extend({
      from: this.config.from,
      subject: null,
      body: null,
      bodyTemplate: null,
      templateVars: {},
      ctx: {},
      allowEmpty: false
    }, mailOptions);


    if (_.isEmpty(mailOptions.to)) {
      throw new MailerError('Recipients must be set');
    }

    // it not allowed to send empty email
    if (!mailOptions.allowEmpty) {
      if (_.isEmpty(mailOptions.subject) || 
          (_.isEmpty(mailOptions.body) && _.isEmpty(mailOptions.bodyTemplate)) ) {
        throw new MailerError('Subject and body/template must be set');
      }    
    }

    if (!_.isArray(mailOptions.to)) {
      mailOptions.to = [mailOptions.to];
    }

    // templateVars common to all recipients
    mailOptions.templateVars = _.extend({}, this.app.templateVars, mailOptions.ctx.templateVars, 
      yield viewObjects.toViewObjectYieldable(mailOptions.ctx, mailOptions.templateVars)
    );

    return mailOptions;
  }



  * _send (mailOptions) {
    let self = this;

    mailOptions = yield self._prepareMailOptions(mailOptions);

    return yield _.map(mailOptions.to, (recipient) => {
      return co.wrap(function*() {
        // email address
        var email = _.get(recipient, 'emailAddress', recipient);

        self.logger.debug('Email ' + email + ': ' + mailOptions.subject);

        // user-specific templateVars
        var userLocals = _.extend({}, mailOptions.templateVars, 
          yield viewObjects.toViewObjectYieldable(mailOptions.ctx, {
            recipient: recipient
          })
        );

        // render body
        var body = yield self._renderBody(mailOptions, userLocals);
        var subject = yield self._renderSubject(mailOptions, userLocals);

        // setup actual options
        var sendOptions = _.extend({
          from: mailOptions.from,
        }, {
          to: email,
          subject: subject,
          html: body
        });

        self.logger.debug('Content', sendOptions.html);

        // send
        var ret = yield self._nodeMailer.send(sendOptions);

        // record
        self.app.events.emit('record', 'email', recipient, {
          subject: sendOptions.subject
        });

        return ret;
      })();    
    });
  }




  * render (mailOptions) {
    mailOptions = yield this._prepareMailOptions(mailOptions);

    var recipient = mailOptions.to.pop();

    var email = _.get(recipient, 'emails.0.email', recipient);

    this.logger.debug('Render email ' + email + ': ' + mailOptions.subject);

    // user-specific templateVars
    var userLocals = _.extend({}, mailOptions.templateVars, 
      yield viewObjects.toViewObjectYieldable(mailOptions.ctx, {
        recipient: recipient
      })
    );

    return {
      body: yield this._renderBody(mailOptions, userLocals),
      subject: yield this._renderSubject(mailOptions, userLocals),
    }
  }

}



module.exports = Mailer;





