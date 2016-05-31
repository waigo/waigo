"use strict";

const waigo = global.waigo,
  _ = waigo._;


module.exports = Promise;


Promise.promisify = function(fn, ctx) {
  ctx = ctx || null;
  
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


Promise.try = function(fn) {
  try {
    return Promise.resolve(fn());
  } catch (err) {
    return Promise.reject(err);
  }
}
