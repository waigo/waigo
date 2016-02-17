"use strict";

const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('support/promise');


module.exports = Promise;


Promise.promisify = function(fn, ctx = null) {
  return function() {
    let args = _.toArray(arguments);

    return new Promise(function(resolve, reject) {
      args.push(function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });

      fn.apply(ctx, args);
    });
  };
};



