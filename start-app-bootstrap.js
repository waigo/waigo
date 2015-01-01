"use strict";

/**
 * @fileOverview
 * 
 * Main bootstrap. We'll get rid of this file once Node 0.12 ships with 
 * ES6 support built-in.
 */


var co = require('co'),
  waigo = require('./');



co(function*() {
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

})(function(err) {
  if (err) {
    console.error(err.stack);
  }
});



