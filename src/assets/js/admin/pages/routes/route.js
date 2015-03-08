var React = require('react');

var Router = require('react-router');

var RenderUtils = require('../../utils/renderUtils');
  

module.exports = React.createClass({
  mixins: [Router.State],

  getInitialState: function() {
    var key = decodeURIComponent(this.getParams().key),
      slashPos = key.indexOf('/'),
      method = key.substr(0, slashPos).toUpperCase(),
      url = key.substr(slashPos+1);

    return {
      url: url,
      method: method,
      error: null,
    };
  },

  render: function() {
    var error = (this.state.error ? <div className="error">{this.state.error}</div> : '');
    
    return (
      <div className="page-route">
        {RenderUtils.buildError(this.state.error)}
        {this.state.method} {this.state.url}
      </div>
    );
  },
});
