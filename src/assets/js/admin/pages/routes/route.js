var React = require('react');

var Router = require('react-router');

var JsonEditor  = require('../../components/jsonEditor'),
  CodeView = require('../../components/codeView'),
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

    var qryStr = $.param(this.state.reqQuery),
      body = this.state.reqBody;

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


  _mimeToCodeLanguage: function(mime) {

    resultLanguage = 'language-';

    if (mime.indexOf('json')) {
      resultLanguage += 'javascript';
    }
    else if (mime.indexOf('html') || mime.indexOf('xml')) {
      resultLanguage += 'xml';
    }
    else {
      resultLanguage += 'none';
    }

  },


  _buildResult: function() {
    if (this.state.result) {
      var xhr = this.state.result.xhr;

      var data = xhr.responseText,
        resultType = (400 <= xhr.status ? 'error' : 'success');

      var mime = xhr.getResponseHeader('Content-Type');

      var label = 'label ' + ('error' === resultType ? 'red': 'blue');

      return (
        <div className={resultType}>
          <p className="meta">
            <span className={label}>{xhr.status} {xhr.statusText}</span>
            <span className={label}>{mime}</span>
            <span className={label}>{xhr.getResponseHeader('Content-Length')} bytes</span>
          </p>
          <CodeView mime={mime} code={data} />
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


  _onQueryStringChange: function(val) {
    try {
      this.setState({
        reqQuery: JSON.parse(val),
        canSubmit: true,
      });      
    } catch (err) {
      this.setState({
        reqQuery: {},
        canSubmit: false
      });
    }
  },


  _onBodyChange: function(val) {
    try {
      this.setState({
        reqBody: JSON.parse(val),
        canSubmit: true,
      });      
    } catch (err) {
      this.setState({
        reqBody: {},
        canSubmit: false
      });
    }
  },



  _buildRequestForm: function() {
    var body = '';
    if ('POST' === this.state.method || 'PUT' === this.state.method) {
      var bodyJson = JSON.stringify(this.state.reqBody);

      body = (
        <div className="form-group">
          <label>Form body (JSON)</label>
          <JsonEditor 
            name="bodyEditor" 
            ref="bodyEditor" 
            onChange={this._onBodyChange}
            value={bodyJson} 
            height="200px" />
        </div>
      );
    }

    var submitBtn;
    if (this.state.canSubmit) {
      submitBtn = <input className="btn btn-primary" type="submit" value="Run" />
    } else {
      submitBtn = <input className="btn btn-primary" type="submit" value="Run" disabled="disabled" />
    }

    var qryStrJson = JSON.stringify(this.state.reqQuery),
      urlQryStr = $.param(this.state.reqQuery);

    return (
      <form onSubmit={this.onSubmit}>
        <div className="form-group">
          <label>Query string (JSON): <strong>{urlQryStr}</strong></label>
          <JsonEditor 
            name="qsEditor" 
            ref="qsEditor" 
            onChange={this._onQueryStringChange}
            value={qryStrJson} />
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
        <h2>{this.state.method} {this.state.url}</h2>
        {this._buildRequestForm()}
        <div className="result">
          {this._buildResult()}
        </div>
      </div>
    );
  },
});
