import { IndexRoute, Route, Router, hashHistory } from 'react-router';

var React = require('react');
const ReactDOM = require('react-dom');

var Models = require('./models');
var Model = require('./model');
var Row = require('./row');


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
        <IndexRoute component={Models} />
        <Route path=":key" component={Model} />
        <Route path=":key/:id" component={Row} />
      </Route>
    </Router>
  ), rootElem);

};

