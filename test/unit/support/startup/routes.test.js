"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['routes'] = {
  beforeEach: function*() {
    this.createAppModules({
      'routes/index': 'module.exports = { "GET /": "test.index" };',
      'support/routeMapper': 'module.exports = { map: function() {} };'
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.setup = waigo.load('support/startup/routes');
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'loads routes': function*() {
    yield this.setup(this.app);

    this.app.routes['GET /'].should.eql('test.index');
  },
  'maps routes': function*() {
    let routeMapper = waigo.load('support/routeMapper'),
      mapSpy = this.mocker.spy(routeMapper, 'map');

    yield this.setup(this.app);

    mapSpy.should.have.been.calledOnce;
    mapSpy.should.have.been.calledWithExactly(this.app, this.app.routes);
  },
  'enables Koa router': function*() {
    let appUseSpy = this.mocker.spy(this.app, 'use');

    yield this.setup(this.app);

    appUseSpy.should.have.been.calledOnce;
    appUseSpy.should.have.been.calledWithExactly(this.app.router);
  },


  'routeUrl': {
    beforeEach: function*() {
      yield this.setup(this.app);

      this.app.routes.byName = {
        'test': {
          url: '/test/:name/:age'
        }
      };
    },

    'invalid name': function*() {
      this.expect(() => {
        this.app.routeUrl('blah')
      }).to.throw('No route named: blah');
    },

    'params': function*() {
      let url = this.app.routeUrl('test', {
        name: 'john',
        age: 23,
        state: 'CO',
      });

      url.should.eql('/test/john/23');
    },

    'query': function*() {
      let url = this.app.routeUrl('test', {
        name: 'john',
        age: 23,
        state: 'CO',
      }, {
        master: 'blaster',
        hood: 'wink'
      });

      url.should.eql('/test/john/23?hood=wink&master=blaster');
    },

    'absolute url': function*() {
      this.app.config.baseURL = 'http://waigojs.com';

      let url = this.app.routeUrl('test', {
        name: 'john',
        age: 23,
        state: 'CO',
      }, {
        master: 'blaster',
        hood: 'wink'
      }, {
        absolute: true,
      });

      url.should.eql('http://waigojs.com/test/john/23?hood=wink&master=blaster');
    },


  },
};
