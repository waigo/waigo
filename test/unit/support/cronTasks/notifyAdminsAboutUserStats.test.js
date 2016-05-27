"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


test['notify admins about user stats'] = {
  beforeEach: function*() {
    yield this.initApp();
    yield this.startApp({
      startupSteps: ['db', 'models', 'mailer'],
      shutdownSteps: ['db'],
    });
    yield this.clearDb('User');

    this.ctx = {
      app: this.app,
    };

    this.task = waigo.load('support/cronTasks/notifyAdminsAboutUserStats');
  },

  afterEach: function*() {
    yield this.clearDb();
    
    yield this.shutdownApp();
  },

  'schedule': function*() {
    this.expect(this.task.schedule).to.eql('0 0 3 * * 1');
  },

  'handler': {
    beforeEach: function*() {
      this.mocker.stub(this.app.mailer, 'send', () => Q.resolve());
    },
    'no admins': function*() {
      yield this.task.handler(this.app);

      this.app.mailer.send.should.not.have.been.called;
    },
    'have admins but no registrations': function*() {
      let user = yield this.app.models.User.register({
        username: 'admin',
        roles: ['admin'],
        email: 'admin@waigojs.com',
      });        
      user.created = moment().add('days', -8).toDate();
      yield user.save();

      yield this.task.handler(this.app);

      this.app.mailer.send.should.have.been.calledOnce;      
      let arg = _.get(this.app.mailer.send.args, '0.0');

      this.expect(_.get(arg, 'subject')).to.eql('Report - user signups during past 7 days');
      this.expect(_.get(arg, 'bodyTemplate')).to.eql('reportUserSignups');
      this.expect(_.get(arg, 'templateVars')).to.eql({
        from: moment().add('days', -7).format('MMMM DD, YYYY'),
        to: moment().format('MMMM DD, YYYY'),
        users: [],
      });
    },
    'have admins and registrations': function*() {
      let user1 = yield this.app.models.User.register({
        username: 'user',
        email: 'user@waigojs.com',
      });

      let user2 = yield this.app.models.User.register({
        username: 'user2',
        email: 'user2@waigojs.com',
      });
      user2.created = moment().add('days', -8).toDate();
      yield user2.save();

      let user3 = yield this.app.models.User.register({
        username: 'admin',
        roles: ['admin'],
        email: 'admin@waigojs.com',
      });

      yield this.task.handler(this.app);

      this.app.mailer.send.should.have.been.calledOnce;      
      let arg = _.get(this.app.mailer.send.args, '0.0');

      this.expect(_.get(arg, 'subject')).to.eql('Report - user signups during past 7 days');
      this.expect(_.get(arg, 'bodyTemplate')).to.eql('reportUserSignups');
      this.expect(_.get(arg, 'templateVars.users', []).length).to.eql(2);

      let ids = arg.templateVars.users.map((u) => u.id);

      ids.should.eql([user1.id, user3.id]);
    },
  },
};
