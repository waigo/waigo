var React = require('react');
var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;

var PageRoutes = require('./index');
var PageRoute = require('./route');


var App = React.createClass({
  render: function() {
    return (
      <RouteHandler {...this.props}/>
    );
  }
});


var routes = (
  <Route handler={App}>
    <DefaultRoute name="routes" handler={PageRoutes} />
    <Route name="route" path=":key" handler={PageRoute} />
  </Route>
);


Router.run(routes, Router.HashLocation, function(Handler, state) {
  React.render(<Handler routes={state.routes} params={state.params} query={state.query} />, document.getElementById('react-root'));
});


