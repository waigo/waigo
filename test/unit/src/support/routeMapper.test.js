var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


var app = null,
  routes = null,
  router = null,
  mapper = null;

test['route mapper'] = {
  beforeEach: function(done) {
    routes = {
      'GET /': 'main.index'
    };

    router = {
      get: test.mocker.spy(),
      post: test.mocker.spy(),
      del: test.mocker.spy(),
      delete: test.mocker.spy(),
      put: test.mocker.spy(),
      options: test.mocker.spy(),
      head: test.mocker.spy()
    }

    testUtils.deleteTestFolders()
      .then(testUtils.createTestFolder)
      .then(function() {
        return testUtils.createAppModules({
          'support/middleware/test': 'var a = function*() {}; module.exports = function() { return a }; a.ref = a;',
          'support/middleware/test_options': 'module.exports = function(app, o) { return function*() { return o; } };'
        });
      })
      .then(waigo.initAsync)
      .then(function() {
        app = waigo.load('application').app;
        mapper = waigo.load('support/routeMapper');

        app.route = test.mocker.spy(function() {
          return router;
        });
      })
      .nodeify(done);
  },
  afterEach: function(done) {
    testUtils.deleteTestFolders().nodeify(done);
  },
  'URL format': {
    '[GET]': function() {  
      expect(function() {
        mapper.map(app, {
          'GET': 'main.index'
        });
      }).to.throw('Invalid route URL format: GET');
    },
    '[/]': function() {  
      expect(function() {
        mapper.map(app, {
          '/': 'main.index'
        });
      }).to.throw('Invalid route URL format: /');
    },
    '[  GET    /   ]': function() {  
      expect(function() {
        mapper.map(app, {
          '  GET    /   ': 'main.index'
        });
      }).to.not.throw(Error);
    },
    '[GET /]': function() {  
      expect(function() {
        mapper.map(app, routes);
      }).to.not.throw(Error);
    }
  },
  'HTTP method': {
    'GET': function() {  
      expect(function() {
        mapper.map(app, {'GET /': 'main.index'});
      }).to.not.throw(Error);
    },
    'POST': function() {  
      expect(function() {
        mapper.map(app, {'POST /': 'main.index'});
      }).to.not.throw(Error);
    },
    'DEL': function() {  
      expect(function() {
        mapper.map(app, {'DEL /': 'main.index'});
      }).to.not.throw(Error);
    },
    'DELETE': function() {  
      expect(function() {
        mapper.map(app, {'DELETE /': 'main.index'});
      }).to.not.throw(Error);
    },
    'PUT': function() {  
      expect(function() {
        mapper.map(app, {'PUT /': 'main.index'});
      }).to.not.throw(Error);
    },
    'OPTIONS': function() {  
      expect(function() {
        mapper.map(app, {'OPTIONS /': 'main.index'});
      }).to.not.throw(Error);
    },
    'HEAD': function() {  
      expect(function() {
        mapper.map(app, {'HEAD /': 'main.index'});
      }).to.not.throw(Error);
    },
    'INVALID': function() {  
      expect(function() {
        mapper.map(app, {'INVALID /': 'main.index'});
      }).to.throw('Unsupported route HTTP method: INVALID');
    },
  },
  'controller.method': {
    'invalid controller': function() {
      expect(function() {
        mapper.map(app, {'HEAD /': 'invalid.index'});
      }).to.throw('Module not found: controllers/invalid');      
    },
    'invalid method': function() {
      expect(function() {
        mapper.map(app, {'HEAD /': 'main.invalid'});
      }).to.throw('Unable to find method "invalid" on controller "main"');            
    },
    'valid reference': function() {
      expect(function() {
        mapper.map(app, {'HEAD /': 'main.index'});
      }).to.not.throw(Error);                  
    },
    'object reference': function() {
      expect(function() {
        mapper.map(app, {
          'HEAD /': { 
            id: 'main.index', 
            dummy: true
          } 
        });
      }).to.throw('Module not found: support/middleware/main.index');                  
    }
  },
  'middleware': {
    'invalid reference': function() {
      expect(function() {
        mapper.map(app, {'HEAD /': 'invalid'});
      }).to.throw('Module not found: support/middleware/invalid');      
    },
    'valid reference': function() {
      expect(function() {
        mapper.map(app, {'HEAD /': 'test'});
      }).to.not.throw(Error);                  
    },
    'object reference': function() {
      expect(function() {
        mapper.map(app, {'HEAD /': { id: 'test_options', dummy: true }});
      }).to.not.throw(Error);                  
    }
  },
  'automatic path ordering': function() {
    routes = {
      'GET /': 'main.index',
      'POST /a': 'main.index',
      'DEL /a/b': 'main.index',
      'DELETE /a/b/d': 'main.index',
      'PUT /a/c': 'main.index',
      'OPTIONS /a/b/c': 'main.index',
      'HEAD /b': 'main.index'       
    };

    mapper.map(app, routes);

    expect(app.route.callCount).to.eql(7);
    app.route.getCall(0).args[0].should.eql('/b');
    app.route.getCall(1).args[0].should.eql('/a/c');
    app.route.getCall(2).args[0].should.eql('/a/b/d');
    app.route.getCall(3).args[0].should.eql('/a/b/c');
    app.route.getCall(4).args[0].should.eql('/a/b');
    app.route.getCall(5).args[0].should.eql('/a');
    app.route.getCall(6).args[0].should.eql('/');

    var controllerMethod = waigo.load('controllers/main').index;

    router.get.should.have.been.calledOnce;
    router.get.should.have.been.calledWithExactly(controllerMethod);

    router.post.should.have.been.calledOnce;
    router.post.should.have.been.calledWithExactly(controllerMethod);

    router.del.should.have.been.calledOnce;
    router.del.should.have.been.calledWithExactly(controllerMethod);

    router.delete.should.have.been.calledOnce;
    router.delete.should.have.been.calledWithExactly(controllerMethod);

    router.put.should.have.been.calledOnce;
    router.put.should.have.been.calledWithExactly(controllerMethod);

    router.options.should.have.been.calledOnce;
    router.options.should.have.been.calledWithExactly(controllerMethod);

    router.head.should.have.been.calledOnce;
    router.head.should.have.been.calledWithExactly(controllerMethod);
  },
  'handler chain': function() {
    routes = {
      'GET /': ['main.index', 'test', 'main.index']
    };

    mapper.map(app, routes);

    expect(app.route.callCount).to.eql(1);
    app.route.getCall(0).args[0].should.eql('/');

    var controllerMethod = waigo.load('controllers/main').index,
      middleware = waigo.load('support/middleware/test')();

    router.get.should.have.been.calledOnce;
    router.get.should.have.been.calledWithExactly(controllerMethod, middleware, controllerMethod);
  },
  'middleware with options': function(done) {
    testUtils.spawn(function*() {
      routes = {
        'GET /': [ 
          'test',
          {
            id: 'test_options',
            option1: 1,
            option2: 2
          }
        ]
      };

      mapper.map(app, routes);

      expect(app.route.callCount).to.eql(1);
      app.route.getCall(0).args[0].should.eql('/');

      var middleware = waigo.load('support/middleware/test_options')({
        id: 'test_options',
        option1: 1,
        option2: 2
      });

      router.get.should.have.been.calledOnce;

      var getArgs = router.get.getCall(0).args;
      
      getArgs[0].should.eql(waigo.load('support/middleware/test')());

      var ret = yield* getArgs[1]();

      expect(ret).to.eql({
        id: 'test_options',
        option1: 1,
        option2: 2
      });
    })
      .nodeify(done);
  }
};
