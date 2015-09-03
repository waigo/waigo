var React = require('react');
var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;
var Route = Router.Route;

var Models = require('./models');
var Model = require('./model');
var Row = require('./row');


exports.init = function(rootElem) {

  var App = React.createClass({
    render: function() {
      return (
        <RouteHandler {...this.props}/>
      );
    }
  });


  var routes = (
    <Route handler={App}>
      <DefaultRoute name="models" handler={Models} />
      <Route name="model" path="/:key" handler={Model} />
      <Route name="modelRow" path="/:key/:id" handler={Row} />
    </Route>
  );


  Router.run(routes, Router.HashLocation, function(Handler, state) {
    React.render(<Handler routes={state.routes} params={state.params} query={state.query} />, rootElem);
  });


};

