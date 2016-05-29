"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');

const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;

var viewObjects;



test['view objects'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    viewObjects = waigo.load('support/viewObjects');
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'method name': function() {
    this.expect(viewObjects.METHOD_NAME).to.eql('toViewObject');
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

      var gen1 = viewObjects.toViewObjectYieldable(obj1, ctx),
        gen2 = viewObjects.toViewObjectYieldable(obj2, ctx);

      let res = yield [gen1, gen2];

      this.expect(res).to.eql([
        { dummy: 5 },
        { 
          abc: 2,
          ghi: {
            master: 5
          }
        },
      ]);
    },

    'date items are unchanged': function*() {
      var date1 = new Date();

      var obj1 = {
        def: date1,
      };

      var ctx = 5;

      var gen1 = viewObjects.toViewObjectYieldable(obj1, ctx);

      let res = yield [gen1];

      this.expect(res).to.eql([
        { def: date1 },
      ]);
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

      let obj1 = yield viewObjects.toViewObjectYieldable(arr1, ctx);

      this.expect(obj1).to.eql([
        { dummy: 5 },
        { abc: 2 },
      ]);
    },

    'object': function*() {
      var obj = {
        a: {
          def: 1,
          toViewObject: function*(ctx) {
            return {
              dummy: ctx
            };
          }
        },
        b: {
          abc: 2
        },
      };

      var ctx = 5;

      let obj1 = yield viewObjects.toViewObjectYieldable(obj, ctx);

      this.expect(obj1).to.eql({
        a: { dummy: 5 },
        b: { abc: 2 },
      });
    },

    'schema types': function*() {
      this.expect(yield viewObjects.toViewObjectYieldable(String, 5)).to.eql('String');
      this.expect(yield viewObjects.toViewObjectYieldable(Boolean, 5)).to.eql('Boolean');
      this.expect(yield viewObjects.toViewObjectYieldable(Number, 5)).to.eql('Number');
      this.expect(yield viewObjects.toViewObjectYieldable(Date, 5)).to.eql('Date');
      this.expect(yield viewObjects.toViewObjectYieldable(Object, 5)).to.eql('Object');
      this.expect(yield viewObjects.toViewObjectYieldable(Array, 5)).to.eql('Array');
    },


    'null': function*() {
      this.expect(yield viewObjects.toViewObjectYieldable(null, 5)).to.eql(null);
    },

    'string': function*() {
      this.expect(yield viewObjects.toViewObjectYieldable('abc', 5)).to.eql('abc');
    },

    'number': function*() {
      this.expect(yield viewObjects.toViewObjectYieldable(1.2, 5)).to.eql(1.2);
    },

    'boolean': function*() {
      this.expect(yield viewObjects.toViewObjectYieldable(true, 5)).to.eql(true);
    },

  },
  
};



