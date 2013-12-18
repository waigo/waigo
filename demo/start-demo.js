/**
 * Demo app for waigo framework.
 *
 * This demo app is essentially the Waigo.io documentation website.
 */

// Since we're running within Waigo itself we can't use require('waigo')
waigo = require('../index');


waigo.load('server').start()
  .done(function() {
    console.log('Server started!');
  });
