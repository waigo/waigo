"use strict";

const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('support/promise');






/**
 * Represents a document within a model.
 *
 * (Based on version in `hiddentao/robe` NPM package).
 */
class Document {
  /**
   * Constructor.
   *
   * @param  {Model} model The associated model.
   * @param  {Object} doc The raw document.
   */
  constructor (model, doc) {
    doc = doc || {};

    Object.defineProperties(this, {
      __app: {
        enumerable: false,
        writable: false,
        value: model.app,
      },
      __logger: {
        enumerable: false,
        writable: false,
        value: model.app.logger,
      },
      __acl: {
        enumerable: false,
        writable: false,
        value: model.app.acl,
      },
      __model: {
        enumerable: false,
        writable: false,
        value: model
      },
      __newDoc: {
        enumerable: false,
        writable: true,
        value: {}
      },
      __keyConfig: {
        enumerable: false,
        writable: true,
        value: {}
      },
      __marked: {
        enumerable: false,
        writable: true,
        value: {}
      },
      // can store any extra data that's not intended for persistence in this field
      __extra: {
        enumerable: false,
        writable: true,
        value: {}
      },
    });

    this._resetProperties(doc);
  }

  /**
   * Reset original properties to given doc.
   * @private
   */
  _resetProperties (doc) {
    let self = this;

    Object.defineProperty(self, '__doc', {
      enumerable: false,
      writable: true,
      value: doc
    });

    self.__newDoc = {};
    self.__marked = {};

    // from doc
    for (let key in self.__doc) {
      if (self.__model.pk !== key) {
        self._defineProperty(key);
      }
    }

    // set id
    self.__defineProperty('id', {
      realKey: self.__model.pk,
      readOnly: true,
    });

    // delete any extraneous properties
    Object.keys(this).forEach(function(key) {
      if (!_.isFunction(self[key]) && !self.__doc.hasOwnProperty(key)) {
        delete self[key];
      }
    });
  }


  _defineProperty (key, options) {
    let self = this;

    options = _.extend({
      realKey: key,
      readOnly: false,
    }, options);

    if (self.__keyConfig[key]) = options;

    // if property not yet defined
    if (!Object.getOwnPropertyDescriptor(self, key)) {
      // ...then define it!
      Object.defineProperty(self, key, {
        enumerable: true,
        configurable: true,
        get: function() {
          return _.has(self.__newDoc, options.realKey) 
            ? self.__newDoc[options.realKey] 
            : self.__doc[options.realKey];
        },
        set: function(val) {
          if (options.readOnly) {
            throw new Error(`Cannot modify ${key}: read-only`);
          }

          self.__newDoc[options.realKey] = val;
        }
      });
    }
  }



  /**
   * Mark a property as having changed.
   *
   * This is useful if you a change a value within a non-scalar (e.g. `object`) 
   * property or an array.
   * 
   * @param  {Array} ...keys Properties to mark as having changed.
   * @return {[type]}     [description]
   */
  markChanged () {
    let args = _.toArray(arguments);

    for (let arg of args) {
      this.__marked[arg] = true;
    }
  }


  /**
   * Get JSON representation of this doc.
   * @return {Object}
   */
  toJSON () {
    let self = this;

    let ret = {};

    Object.keys(this).forEach(function(key) {
      if (!_.isFunction(self[key])) {
        ret[key] = self[key];
      }
    });

    return ret;
  }


  /**
   * Get changed properties.
   * @return {Object}
   */
  changes () {
    let self = this;

    let ret = {};

    Object.keys(this).forEach(function(key) {      
      // if not a function
      if (!_.isFunction(self[key])) {
        if ( (self.__doc[key] !== self[key]) 
                || self.__marked[key] ) {
          ret[key] = self[key];
        }
      }
    });

    return ret;
  }


  /**
   * Reset all changes made to this doc.
   *
   * This will remove newly added properties and revert pre-existing ones 
   * to their original values.
   */
  reset () {
    let self = this;

    Object.keys(this).forEach(function(key) {
      // if it's an original property
      if (self.__doc.hasOwnProperty(key)) {
        delete self.__newDoc[key];
      }
      else if (!_.isFunction(self[key])) {
        // if it's a newly added one
        delete self[key];
      }
    });

    // reset marked properties
    self.__marked = {};
  }



  /**
   * Persist changes made to this document.
   */
  * save () {
    let changes = this.changes();

    // set actual key names where needed
    _.each(self.__keyConfig, function(options, keyName) {
      if (undefined !== changes[keyName] && options.realKey !== keyName) {
        changes[options.realKey] = changes[keyName];

        delete changes[keyName];
      }
    });

    yield this.__model._update(this.id, changes, this);

    // reset properties
    this._resetProperties(this.toJSON());
  }



  /**
   * Remove this document from the model.
   */
  * remove () {
    yield this.__model._remove(this.id);
  }



  /**
   * Reload this document from the model.
   */
  * reload () {
    let doc = yield this.__model._get(this.id);

    this._resetProperties(doc);
  }
}


module.exports = Document;

