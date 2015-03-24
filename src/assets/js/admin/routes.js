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
    <Route name="routes" path="/routes" handler={Routes} />
    <Route name="route" path="/route/:key" handler={Route} />
    <Route name="models" path="/models" handler={Models} />
    <Route name="model" path="/model/:key" handler={Model} />
    <Route name="modelRow" path="/modelRow/:key/:id" handler={ModelRow} />
  </Route>
);
