/**
 * Test command.
 */
var Command = module.exports = function() {
  this.description = 'Test command';
  this.options = [];
};


/**
 * Run this command.
 */
Command.prototype.run = function*() {
  console.log('TEST COMMAND INVOKED!');
};

