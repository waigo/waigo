"use strict";

const _ = require('lodash'),
  co = require('co'),
  FormData = require('form-data'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['forgot_password'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp();

    yield this.clearDb();

    this.basePath = '/user/forgot_password';
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  GET: {
    'html': function*() {
      let res = yield this.fetch(this.basePath);

      res.body.should.contain('Forgot password');
      res.body.should.contain('<form');
    },
    'json': function*() {
      let res = yield this.fetch(this.basePath, {
        query: {
          format: 'json',
        }
      });

      let json = JSON.parse(res.body);

      json.form.should.be.defined;
    },      
  },
  'POST': {
    failure: {
      html: function*() {
        try {
          yield this.fetch(this.basePath, {
            method: 'POST',
            body: {},
          });        

          throw -1;
        } catch (err) {
          err.statusCode.should.eql(400);

          let body = err.response.body;

          body.should.contain('<form');
          body.should.contain('FormValidationError');
          body.should.contain('Email address / Username: Must be set');
        }          
      },
      json: function*() {
        try {
          yield this.fetch(this.basePath, {
            method: 'POST',
            body: {},
            query: {
              format: 'json'
            }
          });

          throw -1;
        } catch (err) {
          let body = JSON.parse(err.response.body);

          body.form.should.be.defined;
          body.error.type.should.eql('FormValidationError');
          body.error.details.email[0].should.eql('Must be set');
          body.error.details.__csrf[0].should.eql('Must be set');
        }
      },
    },
    'do it!': {
      beforeEach: function*() {
        yield this.App.models.User.register({
          username: 'test123',
          email: 'test@waigojs.com',
          password: 'blah',
        });

        this.submitForm = (function*(opts) {
          const res = yield this.fetch(this.basePath, {
            query: {
              format: 'json'
            }
          });

          const body = JSON.parse(res.body);

          const cookie = res.headers['set-cookie'];

          let form = _.extend({
            '__csrf': body.form.fields.__csrf.value
          }, opts.body);

          this.res = yield this.fetch(this.basePath, _.extend({
            method: 'POST',
            headers: {
              cookie: cookie,
            },
            query: {
              format: 'json'
            },
            body: form,
          }, _.omit(opts, 'body')));
        }).bind(this);
      },
      'bad username': function*() {
        try {
          yield this.submitForm({
          body: {
            email: 'wer',
          }
        });
          throw -1;
        } catch (err) {
          err.response.body.should.contain('User not found');
        }
      },
      'records activity': function*() {
        let spy = this.mocker.spy();

        this.App.on('record', spy);

        yield this.submitForm({
          body: {
            email: 'test123',
          }
        });
  
        spy.should.have.been.calledWith('reset_password');
        _.get(spy, 'args.0.1.username').should.eql('test123');
      },
      'send email': function*() {
        this.mocker.stub(this.App.mailer, 'send', () => Q.resolve());

        yield this.submitForm({
          body: {
            email: 'test123',
          }
        });

        this.App.mailer.send.should.have.been.calledOnce;

        let args = this.App.mailer.send.getCall(0).args[0];

        _.get(args, 'to.username').should.eql('test123');
        _.get(args, 'subject').should.eql('Reset your password');
        _.get(args, 'templateVars.link').should.contain(
          this.App.routes.url('reset_password', null, null, { absolute: true })
        );
      },
    },
  },
};

