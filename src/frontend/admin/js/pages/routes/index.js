import { IndexRoute, Route, Router, hashHistory } from 'react-router';

var React = require('react');
const ReactDOM = require('react-dom');

var PageRoutes = require('./routes');
var PageRoute = require('./route');


exports.init = function(rootElem) {

  const App = React.createClass({
    childContextTypes: {
      location: React.PropTypes.object,
      params: React.PropTypes.object,
    },

    getChildContext: function() {
      return { 
        location: this.props.location,
        params: this.props.params,
      };
    },

    render: function() {
      return this.props.children;
    }
  });

  ReactDOM.render((
    <Router history={hashHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={PageRoutes} />
        <Route path="/:key" component={PageRoute} />
      </Route>
    </Router>
  ), rootElem);

};
