"use strict";

const _ = require('lodash'),
  co = require('co'),
  FormData = require('form-data'),
  path = require('path'),
  moment = require('moment'),
  qs = require('query-string'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['verify email'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp();

    yield this.clearDb();

    this.basePath = '/user/verify_email';

    /*
    submit registration form to get link
     */
    let res = yield this.fetch('/user/register', {
      query: {
        format: 'json'
      }
    });

    this.mocker.stub(this.App.mailer, 'send', () => Q.resolve());

    yield this.fetch('/user/register', {
      method: 'POST',
      headers: {
        cookie: res.headers['set-cookie'],
      },
      query: {
        format: 'json'
      },
      body: {
        email: 'user123@waigojs.com',
        password: 'password',
        '__csrf': JSON.parse(res.body).form.fields.__csrf.value
      }
    });

    this.link = _.get(this.App.mailer.send, 'args.0.0.templateVars.link')
      .substr(this.App.config.baseURL.length);

    this.followLink = (function*(opts) {
      let qry = qs.parse(this.link.substr(this.link.indexOf('?')+1));
      _.extend(qry, opts ? opts.query : {});

      this.res1 = yield this.fetch(this.link, _.extend({
        query: qry
      }, _.omit(opts, 'query')));
    }).bind(this);
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  GET: {
    'html': function*() {
      yield this.followLink();

      this.res1.body.should.contain('Your email address has been verified');
    },
    'json': function*() {
      yield this.followLink({
        query: {
          format: 'json',
        }
      });

      let json = JSON.parse(this.res1.body);

      json.alert.should.eql('Your email address has been verified');
    },      
    'user logged in': function*() {
      yield this.followLink({
        query: {
          format: 'json',
        }
      });

      this.res1.headers['set-cookie'][0].should.contain('user123@waigojs.com');
    },      
  },
};

