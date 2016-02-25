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

    for (let key in self.__doc) {
      // if property not yet defined
      if (!Object.getOwnPropertyDescriptor(self, key)) {
        // ...then define it!
        Object.defineProperty(self, key, {
          enumerable: true,
          configurable: true,
          get: function() {
            return _.has(self.__newDoc, key) ? self.__newDoc[key] : self.__doc[key];
          },
          set: function(val) {
            self.__newDoc[key] = val;
          }
        });
      }
    }

    // delete any extraneous properties
    Object.keys(this).forEach(function(key) {
      if (!_.isFunction(self[key]) && !self.__doc.hasOwnProperty(key)) {
        delete self[key];
      }
    });
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

    yield this.__model._update(this[this.__model.pk], this, changes);

    // reset properties
    this._resetProperties(this.toJSON());
  }



  /**
   * Remove this document from the model.
   */
  * remove () {
    yield this.__model._remove(this[this.__model.pk]);
  }



  /**
   * Reload this document from the model.
   */
  * reload () {
    let doc = yield this.__model._get(this[this.__model.pk]);

    this._resetProperties(doc);
  }
}


module.exports = Document;

