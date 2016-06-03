"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var html = null,
  config = null;


test['html'] = {
  beforeEach: function*() {
    this.createAppModules({
      'views/test': 'p hello!',
      'views/test_params': 'p hello #{text}!',
      'views/test_params_2': 'p hello #{text}, #{prettyPrint(text2)}!'
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    html = waigo.load('support/outputFormats/html');

    config = { 
      folder: 'views', 
      ext: 'js',
      engine: {
        'js': 'pug'
      }
    };
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'returns rendering middleware': function*() {
    var obj = html.create(this.App.logger, config);
    
    _.isGenFn(obj.render).should.be.true;
  },

  'rendering': {
    beforeEach: function*() {
      this.render = html.create(this.App.logger, config).render;

      this.ctx = {
        App: this.App
      };
    },
    'renders html to body': function*() {
      var render = this.render, 
        ctx = this.ctx;

      yield render.call(ctx, 'test_params');

      this.expect(ctx.body).to.eql('<p>hello !</p>');                     
      this.expect(ctx.type).to.eql('html');                     
    },
    'includes template params': function*() {
      var render = this.render, 
        ctx = this.ctx;

      yield render.call(ctx, 'test_params', { text: 'world' });

      this.expect(ctx.body).to.eql('<p>hello world!</p>');                     
      this.expect(ctx.type).to.eql('html');                     
    },
    'template params override context-level params': function*() {
      var render = this.render, 
        ctx = this.ctx;

      yield function*() {
        ctx.templateVars = {
          text: 'sheep',
          text2: 'bee',
          prettyPrint: function(str) {
            return '^' + str + '^';
          }
        };

        yield render.call(ctx, 'test_params_2', {
          text2: 'cow'  // should override app.templateVars.text2
        });
      };

      this.expect(ctx.body).to.eql('<p>hello sheep, ^cow^!</p>');
      this.expect(ctx.type).to.eql('html');                     
    },
    'context-level params override application-level params ': function*() {
      var render = this.render, 
        ctx = this.ctx;

      yield function*() {
        ctx.App = {
          templateVars: {
            text: 'goat',
            text2: 'bee',
            prettyPrint: function(str) {
              return '^' + str + '^';
            }
          }
        };

        ctx.templateVars = {
          text: 'sheep',
        };

        yield render.call(ctx, 'test_params_2');
      };

      this.expect(ctx.body).to.eql('<p>hello sheep, ^bee^!</p>');
      this.expect(ctx.type).to.eql('html');                     
    },
  },

  'redirect': {
    beforeEach: function*() {
      this.redirect = html.create(this.App.logger, config).redirect;

      this.ctx = {
        response: {
          redirect: this.mocker.spy()
        }
      };
    },
    'redirects to url': function*() {
      var redirect = this.redirect, 
        ctx = this.ctx;

      yield redirect.call(ctx, 'test_params');

      ctx.response.redirect.should.have.been.calledOnce;
      ctx.response.redirect.should.have.been.calledWithExactly('test_params');
    },
  },
};
