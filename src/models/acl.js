"use strict";

const Q = require('bluebird');


exports.schema = {
  resource: { 
    type: String, 
    required: true,
  },
  entityType: {
    type: String,
    required: true,
    enum: ['role', 'user'],
  },
  entity: {
    type: String,
    required: true,
  }
};



exports.modelMethods = {
  onChange:function(cb) {
    return Q.resolve(this.rawQry().changes())
      .then(cb)
      .catch((err) => {
        this._logger().error(`${this.name} changes error`, err);
      });
  },
};



