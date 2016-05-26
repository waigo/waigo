"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var json = null;


test['json'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    json = waigo.load('support/outputFormats/json');
  },

  afterEach: function*() {
    yield this.Application.shutdown();
  },

  'returns rendering middleware': function*() {
    var obj = json.create(this.app.logger);

    _.isGenFn(obj.render).should.be.true;
  },

  'rendering': {
    beforeEach: function*() {
      this.render = json.create(this.app.logger).render;

      this.ctx = {
        app: this.app,
      };
    },
    'must be plain object': function*() {
      var render = this.render, 
        ctx = this.ctx;

      yield this.shouldThrow(render.call(ctx, 'test', 'bla'), 'Object required for JSON output format');
    },
    'renders JSON': function*() {
      var render = this.render, 
        ctx = this.ctx;

      yield render.call(ctx, 'test', {
          hello: 'world'
      });


      this.expect(ctx.body).to.eql({
        hello: 'world'
      });                     

      this.expect(ctx.type).to.eql('json');                     
    },
  },

  'redirect': {
    beforeEach: function*() {
      this.redirect = json.create(this.app.logger).redirect;

      this.ctx = {
        app: this.app,
      };
    },
    'must be plain object': function*() {
      var redirect = this.redirect, 
        ctx = this.ctx;

      yield redirect.call(ctx, 'test');

      this.expect(ctx.body).to.eql({
        redirectTo: 'test'
      });                     
      this.expect(ctx.type).to.eql('json');
      this.expect(ctx.status).to.eql(200);
    },

  },
};
