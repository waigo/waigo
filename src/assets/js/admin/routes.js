var React = require('react');
var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;

var App = require('./app');

var Home = require('./pages/home');
var Routes = require('./pages/routes/index');
var Route = require('./pages/routes/route');
var Models = require('./pages/models/index');
var Model = require('./pages/models/model');
var ModelRow = require('./pages/models/row');

module.exports = (
  <Route handler={App}>
    <DefaultRoute name="home" handler={Home} />
    <Route name="route" path="/routes/:key" handler={Route} />
    <Route name="routes" path="/routes" handler={Routes} />
    <Route name="modelRow" path="/models/:key/:id" handler={ModelRow} />
    <Route name="model" path="/models/:key" handler={Model} />
    <Route name="models" path="/models" handler={Models} />
  </Route>
);
