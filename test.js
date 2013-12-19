Promise = require('bluebird'),
  suspend = require('suspend');


var a = function() {
  console.log(1);
  return Promise.resolve();
};

var b = function() {
  console.log(2);
  return Promise.resolve();
};

var c = function() {
  console.log(3);
  return Promise.resolve();
};

var start = suspend(function*() {
  yield a();
  yield b();
  yield c();
});

start();
