var React = require('react');
var Router = require('react-router');

var routes = require('./routes');

Router.run(routes, Router.HashLocation, function(Handler, state) {
  React.render(<Handler params={state.params} query={state.query} />, document.getElementById('react-root'));
});
