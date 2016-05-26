var moment = require('moment'),
  path = require('path'),
  Q = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


var viewObjects = null;


test['viewObjects'] = {
  beforeEach: function*() {
    waigo.initAsync()
      .then(function() {
        viewObjects = waigo.load('support/viewObjects');        
      })
      .nodeify(done);
  },

  'method name': function() {
    expect(viewObjects.methodName).to.eql('toViewObject');
  },

  'get view object yieldables': {

    'object': function*() {
      var obj1 = {
        def: 1,
        toViewObject: function*(ctx) {
          return {
            dummy: ctx
          };
        }
      };

      var obj2 = {
        abc: 2,
        ghi: {
          toViewObject: function*(ctx) {
            return {
              master: ctx
            };
          }
        }
      };

      var ctx = 5;

      var gen1 = viewObjects.toViewObjectYieldable(ctx, obj1),
        gen2 = viewObjects.toViewObjectYieldable(ctx, obj2);

      testUtils.spawn(function*() { 
        return yield [gen1, gen2];
      })
        .then(function(res) {
          expect(res).to.eql([
            { dummy: 5 },
            { 
              abc: 2,
              ghi: {
                master: 5
              }
            },
          ])
        })
        .nodeify(done);
    },

    'date items are unchanged': function*() {
      var date1 = new Date();

      var obj1 = {
        def: date1,
      };

      var ctx = 5;

      var gen1 = viewObjects.toViewObjectYieldable(ctx, obj1);

      testUtils.spawn(function*() { 
        return yield [gen1];
      })
        .then(function(res) {
          expect(res).to.eql([
            { def: date1 },
          ])
        })
        .nodeify(done);
    },


    'array': function*() {
      var arr1 = [
        {
          def: 1,
          toViewObject: function*(ctx) {
            return {
              dummy: ctx
            };
          }
        },
        {
          abc: 2
        },
      ];

      var ctx = 5;

      var y1 = viewObjects.toViewObjectYieldable(ctx, arr1);

      testUtils.spawn(function*() {
        return yield y1;
      })
        .then(function(obj1) {
          expect(obj1).to.eql([
            { dummy: 5 },
            { abc: 2 },
          ]);
        })
        .nodeify(done);
    },

    'null': function() {
      expect(viewObjects.toViewObjectYieldable(5, null)).to.eql(null);
    },

    'string': function() {
      expect(viewObjects.toViewObjectYieldable(5, 'abc')).to.eql('abc');
    },

    'number': function() {
      expect(viewObjects.toViewObjectYieldable(5, 1.2)).to.eql(1.2);
    },

    'boolean': function() {
      expect(viewObjects.toViewObjectYieldable(5, true)).to.eql(true);
    },

  },
  
};



