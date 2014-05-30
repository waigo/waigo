"use strict";


var waigo = require('../../../');



/**
 * This command creates the barebones structure of a basic Waigo application, 
 * enough to run your application.
 */
module.exports = {
  description: 'Initialise and create a skeleton Waigo app',

  options: [
    ['--app-folder [folder]', 'Relative path to application root folder', 'src']
  ],

  run: function*() {
    console.log(1);
    console.log(arguments);
  }
};


