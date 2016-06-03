"use strict";

const _ = require('lodash'),
  co = require('co'),
  FormData = require('form-data'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['/user'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp();

    yield this.clearDb();
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },


  '/register': {
    beforeEach: function*() {
      this.basePath = '/user/register';
    },
    GET: {
      'html': function*() {
        let res = yield this.fetch(this.basePath);

        res.body.should.contain('Register user');
        res.body.should.contain('<form');
      },
      'json': function*() {
        let res = yield this.fetch(this.basePath, {
          query: {
            format: 'json',
          }
        });

        let json = JSON.parse(res.body);

        json.willCreateAdminUser.should.be.true;
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
            body.should.contain('Password: Must be set');
            body.should.contain('CSRF: Must be set');
            body.should.contain('Email address: Must be set');
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
            body.error.details.password[0].should.eql('Must be set');
            body.error.details.__csrf[0].should.eql('Must be set');
          }
        },
      },
      success: {
        beforeEach: function*() {
          this.mailerSpy = this.mocker.spy(this.app.mailer, 'send');

          this.registerUser = (function*(email, opts) {
            const res = yield this.fetch(this.basePath, {
              query: {
                format: 'json'
              }
            });

            const body = JSON.parse(res.body);

            const cookie = res.headers['set-cookie'];

            let form = {
              email: email,
              password: 'password',
              '__csrf': body.form.fields.__csrf.value
            };

            this.res = yield this.fetch(this.basePath, _.extend({
              method: 'POST',
              headers: {
                cookie: cookie,
              },
              body: form,
            }, opts));
          }).bind(this);
        },
        'user in db': function*() {
          yield this.registerUser('test@waigojs.com');

          let users = yield this.app.models.User.getAll();

          users.length.should.eql(1);
          users[0].username.should.eql('test@waigojs.com');
          users[0].isAdmin.should.be.true;
          users[0].emailAddress.should.eql('test@waigojs.com');
          (yield users[0].isPasswordCorrect('password')).should.be.true;
        },
        'sends email verification link': function*() {
          yield this.registerUser('test@waigojs.com');

          let user = 
            (yield this.app.models.User.getByEmail('test@waigojs.com'));

          this.mailerSpy.should.have.been.calledOnce;

          let args = this.mailerSpy.getCall(0).args[0];

          _.get(args, 'to.id').should.eql(user.id);
          _.get(args, 'subject').should.eql('Thanks for signing up!');
        },
        'cannot register if email address already exists': function*() {
          yield this.registerUser('test@waigojs.com');

          try {
            yield this.registerUser('test@waigojs.com');
            throw -1;
          } catch (err) {
            err.statusCode.should.eql(400);
          }
        },
        'only first user is auto-admin': function*() {
          yield this.registerUser('test@waigojs.com');
          yield this.registerUser('test2@waigojs.com');

          let user = yield this.app.models.User.getByEmail('test2@waigojs.com');

          user.isAdmin.should.be.false;
        },
        html: function*() {
          yield this.registerUser('test@waigojs.com');

          this.res.body.should.contain('You have signed up successfully!');
        },
        json: function*() {
          yield this.registerUser('test@waigojs.com', {
            query: {
              format: 'json'
            }
          });

          let body = JSON.parse(this.res.body);

          body.alert.should.eql('You have signed up successfully!');
        },
      },
    },
  },



};

