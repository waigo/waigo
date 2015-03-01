var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;

var App = require('./app');

var Home = require('./pages/home');

module.exports = (
  <Route handler={App}>
    <Route name="home" path="/admin" handler={Home} />
  </Route>
);
