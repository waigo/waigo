var React = require('react');

var Router = require('react-router');

var RenderUtils = require('../../utils/renderUtils'),
  GuardedStateMixin = require('../../mixins/guardedState');
  

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [GuardedStateMixin],

  getInitialState: function() {
    var key = decodeURIComponent(this.context.router.getCurrentParams().key),
      slashPos = key.indexOf('/'),
      method = key.substr(0, slashPos).toUpperCase(),
      url = key.substr(slashPos+1);

    return {
      url: url,
      method: method,
    };
  },

  onSubmit: function(e) {
    e.preventDefault();

    var self = this;

    var qryStr = React.findDOMNode(this.refs.queryString).value || '';

    var requestBody = {};
    if (this.refs.requestBody) {
      requestBody = JSON.parse(
        React.findDOMNode(this.refs.requestBody).value || '{}'
      );
    }

    this.setState({
      result: null,
      running: true,
    });

    $.ajax({
      async: true,
      timeout: 5000,
      cache: false,
      url: this.state.url + (qryStr ? '?' + qryStr : ''),
      method: this.state.method,
      dataType: 'text',
      data: requestBody,
    })
      .done(function gotResult() {
        self.setStateIfMounted({
          result: {
            xhr: arguments[2],
          }
        });
      })
      .fail(function gotError(xhr) {
        self.setStateIfMounted({
          result: {
            xhr: xhr
          }
        });
      })
      .always(function allDone() {
        self.setStateIfMounted({
          running: false
        });
      });
  },


  _buildResult: function() {
    if (this.state.result) {
      var xhr = this.state.result.xhr;

      var data = xhr.responseText,
        resultType = (400 <= xhr.status ? 'error' : 'success');

      var label = 'label label-' + ('error' === resultType ? 'danger': 'info');

      return (
        <div>
          <p className="meta">
            <span className={label}>{xhr.status} {xhr.statusText}</span>
            <span className={label}>{xhr.getResponseHeader('Content-Type')}</span>
            <span className={label}>{xhr.getResponseHeader('Content-Length')} bytes</span>
          </p>
          <pre className={resultType}>
            {data}
          </pre>
        </div>
      );
    } else {
      if (this.state.running) {
        return (
          <div className="loading">Request in progress...</div>
        );
      } else {
        return '';
      }
    }
  },


  _buildRequestForm: function() {
    var body = '';
    if ('POST' === this.state.method || 'PUT' === this.state.method) {
      body = (
        <div className="form-group">
          <label>Body (must be valid JSON)</label>
          <textarea className="form-control" ref="requestBody" rows="5"></textarea>
        </div>
      );
    }

    return (
      <form onSubmit={this.onSubmit}>
        <div className="form-group">
          <label>Query string</label>
          <input className="form-control" type="text" ref="queryString" placeholder="a=1&b=2..." />
        </div>
        {{body}}
        <input className="btn btn-primary" type="submit" value="Run" />
      </form>
    );
  },


  render: function() {
    var error = (this.state.error ? <div className="error">{this.state.error}</div> : '');
    
    return (
      <div className="page-route">
        <h3>{this.state.method} {this.state.url}</h3>
        {this._buildRequestForm()}
        <div className="result">
          {this._buildResult()}
        </div>
      </div>
    );
  },
});
