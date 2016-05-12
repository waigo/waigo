var React = require('react');

var Router = require('react-router');

var Loader = require('../../components/loader'),
  SubmitBtn = require('../../components/submitButton'),
  CodeEditor  = require('../../components/codeEditor'),
  CodeView = require('../../components/codeView'),
  RenderUtils = require('../../utils/renderUtils'),
  Utils = require('../../utils/general'),
  GuardedStateMixin = require('../../mixins/guardedState');
  

module.exports = React.createClass({
  contextTypes: {
    params: React.PropTypes.object
  },

  mixins: [GuardedStateMixin],

  getInitialState: function() {
    var key = decodeURIComponent(this.context.params.key),
      slashPos = key.indexOf('/'),
      method = key.substr(0, slashPos).toUpperCase(),
      url = key.substr(slashPos);

    return {
      url: url,
      method: method,
      reqQuery: "{}",
      reqBody: "{}",
    };
  },

  onSubmit: function(e) {
    e.preventDefault();

    var self = this;

    var qryStr = this.state.reqQuery.length ? $.param(JSON.parse(this.state.reqQuery)) : {};
    var body = this.state.reqBody.length ? JSON.parse(this.state.reqBody) : {};

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
        });
      });
  },


  _buildResult: function() {
    if (this.state.result) {
      var xhr = this.state.result.xhr;

      var data = xhr.responseText,
        resultType = (400 <= xhr.status ? 'error' : 'success');

      var mime = xhr.getResponseHeader('Content-Type');

      var label = 'label ' + ('error' === resultType ? 'red': 'blue');

      return (
        <div className="result">
          <div className={resultType}>
            <p className="meta">
              <span className={label}>{xhr.status} {xhr.statusText}</span>
              <span className={label}>{mime}</span>
              <span className={label}>{xhr.getResponseHeader('Content-Length')} bytes</span>
            </p>
            <CodeView mime={mime} code={data} />
          </div>
        </div>
      );
    } else {
      if (this.state.running) {
        return (
          <Loader text="Request in progress" />
        );
      } else {
        return '';
      }
    }
  },


  _onQueryStringChange: function(val) {
    this.setState({
      reqQuery: val.length ? val : "{}",
    });      
  },


  _onBodyChange: function(val) {
    this.setState({
      reqBody: val.length ? val : "{}",
    });      
  },



  _buildRequestForm: function() {
    let canSubmit = true;

    var body = '';
    if ('POST' === this.state.method || 'PUT' === this.state.method) {
      var bodyStatus;

      if (!Utils.isValidJSON(this.state.reqBody)) {
        bodyStatus = <span className="invalid">Invalid, please fix!</span>;
        canSubmit = false;
      } else {
        bodyStatus = null;
      }
      
      body = (
        <div className="form-group">
          <label>Form body (JSON): <strong>{bodyStatus}</strong></label>
          <CodeEditor 
            onChange={this._onBodyChange}
            value={this.state.reqBody} 
            height="300px" />
        </div>
      );
    }

    var urlQryStr;

    if (!Utils.isValidJSON(this.state.reqQuery)) {
      urlQryStr = <span className="invalid">Invalid, please fix!</span>;
      canSubmit = false;
    } else {
      urlQryStr = $.param(JSON.parse(this.state.reqQuery));
    }

    return (
      <form onSubmit={this.onSubmit}>
        <div className="form-group">
          <label>Query string (JSON): <strong>{urlQryStr}</strong></label>
          <CodeEditor 
            onChange={this._onQueryStringChange}
            height="100px"
            value={this.state.reqQuery} />
        </div>
        {body}
        <SubmitBtn label="Run" disabled={!canSubmit} />
      </form>
    );
  },


  render: function() {
    return (
      <div className="page-route">
        <h2>{this.state.method} {this.state.url}</h2>
        {this._buildRequestForm()}
        {this._buildResult()}
      </div>
    );
  },
});
