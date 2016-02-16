"use strict";

const co = require('co');
const waigo = module.exports = require('./loader');


/**
 * Bootstrap your application.
 *
 * @return {Coroutine}
 */
waigo._bootstrap = function() {
  return co(function*() {
    /*
    Initialise the framework.

    If you need to override the application source folder and/or plugins to 
    be loaded then this is the place to do it.

     */
    yield waigo.init();

    /*
    Start the application.

    This loads in application configuration, runs all startup steps, sets up 
    the middleware and kicks off the HTTP listener.
     */
    yield waigo.load('application').start();
  });
};

