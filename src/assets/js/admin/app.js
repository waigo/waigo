var React = require('react');
var RouteHandler = require('react-router').RouteHandler;
var Layout = require('./layout/layout.js');


module.exports = React.createClass({
  render: function() {
    return (
      <Layout>
        <RouteHandler {...this.props}/>
      </Layout>
    );
  }
});
