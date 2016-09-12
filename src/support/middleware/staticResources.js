"use strict";


const path = require('path');

const waigo = global.waigo,
  _ = waigo._;



/**
 * Build middleware for serving static resources.
 *
 * This middleware uses [koa-static](https://www.npmjs.org/package/koa-static).
*
 * @param {Object} options Configuration options.
 * @param {String} options.folder The filesystem path (relative to the Waigo app folder) from which to serve resources.
 * @param {Integer} [options.maxage] Browser cache max-age in milliseconds (default is `0`).
 * @param {Boolean} [options.hidden] Whether to serve hidden resources too (default is `false`).
 * @param {String} [options.index] The index file (default is `index.html`).
 * @param {Boolean} [options.defer] if `true` then will serve after `yield next`, allowing downstream middleware to respond first (default is `true`).
 * 
 * @return {Function} middleware
 */
module.exports = function(App, options) {
  let moreOptions = _.extend({
    maxage: 0,
    hidden: false,
    index: 'index.html',
    defer: false
  }, options.options);

  return require('koa-static')(path.join(waigo.getAppFolder(), options.folder), moreOptions);
};
