var React = require('react');

var Router = require('react-router');

var JsonEditor  = require('../../components/jsonEditor'),
  RenderUtils = require('../../utils/renderUtils'),
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
      reqQuery: {},
      reqBody: {},
      canSubmit: true,
    };
  },

  onSubmit: function(e) {
    e.preventDefault();

    var self = this;

    var qryStr = $.param(JSON.parse(this.refs.qsEditor.getValue())  || {});

    var body = JSON.parse(this.refs.bodyEditor.getValue()) || {};

    this.setState({
      result: null,
      running: true,
    });

    $.ajax({
      async: true,
      timeout: 5000,
      cache: false,
      url: this.state.url + (qryStr.length ? '?' + qryStr : ''),
      method: this.state.method,
      dataType: 'text',
      data: body,
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
          running: false,
          reqQuery: qryStr,
          reqBody: body,
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
      var bodyStr = JSON.stringify(this.state.reqBody);

      body = (
        <div className="form-group">
          <label>Request body (JSON)</label>
          <JsonEditor ref="bodyEditor" value={bodyStr} height="200px" />
        </div>
      );
    }

    var submitBtn;
    if (this.state.canSubmit) {
      submitBtn = <input className="btn btn-primary" type="submit" value="Run" />
    } else {
      submitBtn = <input className="btn btn-primary" type="submit" value="Run" disabled="disabled" />
    }

    var qryStr = JSON.stringify(this.state.reqQuery);

    return (
      <form onSubmit={this.onSubmit}>
        <div className="form-group">
          <label>URL query string (JSON)</label>
          <JsonEditor ref="qsEditor" value={qryStr} />
        </div>
        {{body}}
        {{submitBtn}}
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
