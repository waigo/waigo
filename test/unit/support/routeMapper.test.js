"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');

const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;

var mapper;

const noop = function*() {};


test['route mapper'] = {
  beforeEach: function*() {
    this.createAppModules({
      'controllers/hello': 'exports.world = function*() { this.mega.push("hello world"); };',
      'controllers/good': 'exports.bye = function*() { this.mega.push("goodbye"); };',
      'support/middleware/before_next': 'module.exports = function() { return function*(next) { this.mega.push("test"); yield next; }; };',
      'support/middleware/after_next': 'module.exports = function(o) { return function*(next) { yield next; this.mega.push("test_" + o.num); }; };'
    });

    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    mapper = waigo.load('support/routeMapper');

    this.ctx = this.app.createContext({}, {
      setHeader: this.mocker.spy(),
    });
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'no routes or middleware': function*() {
    yield mapper.setup(this.app, {}, {});

    this.expect(this.app.router.match('/')).to.be.undefined;
  },

  'simple routes': {
    beforeEach: function*() {
      yield mapper.setup(this.app, {}, {
        '/': {
          GET: 'hello.world',
          POST: 'good.bye',
        },
        '/blah': {
          PUT: 'hello.world',
        },
      });

      this.ctx.mega = [];
    },
    'test - basic': function*() {
      this.ctx.request.url = '/';
      this.ctx.request.method = 'GET';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['hello world']);
    },
    'test - same url, different method': function*() {
      this.ctx.request.url = '/';
      this.ctx.request.method = 'POST';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['goodbye']);
    },
    'test - different url': function*() {
      this.ctx.request.url = '/blah';
      this.ctx.request.method = 'PUT';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['hello world']);
    },
    /*TODO: FIX 'test - bad url': function*() {
      this.ctx.request.url = '/ark';
      this.ctx.request.method = 'GET';

      yield this.app.router.call(this.ctx, noop);
    },*/
    'test - bad method': function*() {
      this.ctx.request.url = '/';
      this.ctx.request.method = 'PUT';

      yield this.app.router.call(this.ctx, noop);
    },
  },


  'per-route cascading middleware': {
    beforeEach: function*() {
      yield mapper.setup(this.app, {}, {
        '/parent': {
          pre: ['before_next'],
          GET: 'hello.world',
          POST: ['before_next', 'good.bye'],
          '/child': {
            GET: [{ id: 'after_next', num: 123}, 'hello.world'],
          },
        },
      });

      this.ctx.mega = [];
    },

    'pre': function*() {
      this.ctx.request.url = '/parent';
      this.ctx.request.method = 'GET';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['test', 'hello world']);
    },

    'non-pre': function*() {
      this.ctx.request.url = '/parent';
      this.ctx.request.method = 'POST';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['test','test','goodbye']);
    },

    'child': function*() {
      this.ctx.request.url = '/parent/child';
      this.ctx.request.method = 'GET';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['test','hello world','test_123']);
    },  
  },


  'per-http-method middleware': {
    beforeEach: function*() {
      yield mapper.setup(this.app, {
        GET: {
          _order: [
            'before_next',
          ]          
        },
        POST: {
          _order: [
            'after_next',
            'before_next',
          ],
          after_next: {
            num: 999
          },
        },
      }, {
        '/parent': {
          POST: [{ id: 'after_next', num: 111 }, 'good.bye'],
        },
      });

      this.ctx.mega = [];
    },

    'default': function*() {
      this.ctx.request.url = '/parent';
      this.ctx.request.method = 'POST';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['test', 'goodbye', 'test_111', 'test_999']);
    },
  },


  'global common middleware does not play a part': {
    beforeEach: function*() {
      yield mapper.setup(this.app, {
        ALL: {
          _order: [
            'before_next',
          ]          
        },
        POST: {
          _order: [
            'after_next',
            'before_next',
          ],
          after_next: {
            num: 999
          },
        },
      }, {
        '/parent': {
          POST: [{ id: 'after_next', num: 111 }, 'good.bye'],
        },
      });

      this.ctx.mega = [];
    },

    'default': function*() {
      this.ctx.request.url = '/parent';
      this.ctx.request.method = 'POST';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['test', 'goodbye', 'test_111', 'test_999']);
    },
  },


  'controller method as middleware': {
    beforeEach: function*() {
      yield mapper.setup(this.app, {}, {
        '/parent': {
          POST: ['hello.world', 'good.bye'],
        },
      });

      this.ctx.mega = [];
    },

    'default': function*() {
      this.ctx.request.url = '/parent';
      this.ctx.request.method = 'POST';

      yield this.app.router.call(this.ctx, noop);

      this.ctx.mega.should.eql(['hello world']);
    },
  },


  'invalid controller method': function*() {
    yield this.shouldThrow(mapper.setup(this.app, {}, {
      '/parent': {
        POST: 'hello.world2',
      },
    }), 'Unable to find method "world2" on controller "hello"');
  },


  'invalid middleware': function*() {
    yield this.shouldThrow(mapper.setup(this.app, {}, {
      '/parent': {
        POST: 'invalid',
      },
    }), 'File not found: support/middleware/invalid');
  },


  'reverse url lookup': {
    beforeEach: function*() {
      this.mapper = yield mapper.setup(this.app, {}, {
        '/bar/:name/:age': {
          name: 'test',
          GET: 'hello.world',
        },
        '/pub': {
          name: 'test2',
          GET: 'good.bye',
        },
      });
    },

    'invalid name': function*() {
      this.expect(() => {
        this.mapper.url('blah')
      }).to.throw('No route named: blah');
    },

    'params': function*() {
      let url = this.mapper.url('test', {
        name: 'john',
        age: 23,
        state: 'CO',
      });

      url.should.eql('/bar/john/23');
    },

    'query': function*() {
      let url = this.mapper.url('test', {
        name: 'john',
        age: 23,
        state: 'CO',
      }, {
        master: 'blaster',
        hood: 'wink'
      });

      url.should.eql('/bar/john/23?hood=wink&master=blaster');
    },

    'absolute url': function*() {
      this.app.config.baseURL = 'http://waigojs.com';

      let url = this.mapper.url('test2', {
        name: 'john',
        age: 23,
        state: 'CO',
      }, {
        master: 'blaster',
        hood: 'wink'
      }, {
        absolute: true,
      });

      url.should.eql('http://waigojs.com/pub?hood=wink&master=blaster');
    },
  },
};
