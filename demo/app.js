/**
* Demo app for waigo framework.
*
* This demo app is essentially the Waigo.io documentation website.
*/

// Since we're running within Waigo itself we can't use require('waigo')
waigo = require('../index');

waigo.showLoaderLog(true);

waigo.load('server').start()
  .done(function() {
    console.log('Waigo documentation site has started. Please visit http://localhost:3000/ to see it in action!');
  });

