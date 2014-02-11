var Promise = require('bluebird');

var a = function*() {
  throw new Error('fuck');
};


Promise.spawn(a)
  .then(function() {
    console.log('1');
  })
  .catch(function(err) {
    console.log('2');
    console.log(err);
  })
  ;


console.log('down');
