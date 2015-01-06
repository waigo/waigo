"use strict";

/** 
 * @fileOverview Model building.
 */

var compose = require('koa-compose'),
  debug = require('debug')('waigo-model-builder'),
  mongoSchema = require('simple-mongo-schema'),
  Mongorito = require('mongorito');


var waigo = require('../../../'),
  _ = waigo._;



/**
 * Build a new model class.
 */
exports.new = function(params) {
  var db = params.db,
    schema = mongoSchema(params.schema),
    collection = params.collection,
    options = params.options || {};

  debug('new model for: ' + collection);

  var events = ['create', 'update', 'save', 'remove'];

  var defaultPreEventHandlers = {},
    preEventHandlers = {},
    postEventHandlers = {};

  // instance methods

  var InstanceMethods = {
    collection: collection,

    db: db,

    configure: function() {
      var self = this;

      events.forEach(function(e) {
        self.before(e, '_before_' + e);
        self.after(e, '_after_' + e);
      });

      // pre-save validation (always happens at the end)
      self.before('save', function*(next) {
        debug('validating model data against schema: ' + collection);

        schema.validate(this.attributes);

        yield next;
      });
    },
  };

  // before, after hooks
  events.forEach(function(e) {
    preEventHandlers[e] = [];
    postEventHandlers[e] = [];

    InstanceMethods['_before_' + e] = function*(next) {
      if (preEventHandlers[eventName]._chain) {
        yield* preEventHandlers[eventName]._chain.call(this, next);
      }
    };

    InstanceMethods['_after_' + e] = function*(next) {
      if (postEventHandlers[eventName]._chain) {
        yield* postEventHandlers[eventName]._chain.call(this, next);
      }
    };
  });

  InstanceMethods = _.extend(InstanceMethods, options.InstanceMethods);

  // static methods to add before, after hooks
  var StaticMethods = _.extend({
    // 'before' hook
    before: function(eventName, fn) {
      preEventHandlers[eventName].push(fn);
      preEventHandlers[eventName]._chain = compose(preEventHandlers[e]);
    },
    // 'after' hook
    after: function(eventName, fn) {
      postEventHandlers[eventName].push(fn);
      postEventHandlers[eventName]._chain = compose(postEventHandlers[e]);
    },
  }, options.StaticMethods);


  // create new model
  var NewModel = Mongorito.Model.extend(InstanceMethods, StaticMethods);

  return NewModel;
};



