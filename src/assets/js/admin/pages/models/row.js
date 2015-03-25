var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var RenderUtils = require('../../utils/renderUtils'),
  GuardedStateMixin = require('../../mixins/guardedState');


module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [GuardedStateMixin],

  getInitialState: function() {
    var params = this.context.router.getCurrentParams();

    return {
      modelName: decodeURIComponent(params.key),
      id: decodeURIComponent(params.id),
      error: null,
    };
  },

  render: function() { 
    var result = null;

    if (undefined === this.state.data) {
      result = (
        <div className="loading">Loading data...</div>
      );
    } else {
      result = this._buildEditingForm();
    }

    return (
      <div className="page-modelRow">
        <h4 className="title">{this.state.modelName}/{this.state.id}</h4>
        {RenderUtils.buildError(this.state.error)}
        {result}
      </div>
    );
  },


  _onEdit: function(e) {
    this.setState({
      edit: this._getLatestEdit()
    });
  },


  _getLatestEdit: function() {
    return React.findDOMNode(this.refs.editInput).value;
  },


  _onSubmit: function() {
    var self = this;

    this.setState({
      submitting: true
    });

    $.ajax({
      method: 'PUT',
      url: `/admin/model/doc?format=json&name=${this.state.modelName}&id=${this.state.id}`,
      data: {
        doc: JSON.parse(this._getLatestEdit())
      }
    })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      })
      .always(function() {
        self.setStateIfMounted({
          submitting: false
        });
      })
    ;
  },


  _buildEditingForm: function() {
    var data = this.state.edit || JSON.stringify(this.state.data);

    // button disabled if invalid value
    var isDisabled = '';
    try {
      // disallow bad JSON
      var parsed = JSON.parse(data);

      // disallow empty data
      if (!_.keys(parsed).length) {
        throw new Error();
      }
    } catch (e) {
      isDisabled = 'disabled';
    }

    return (
      <div>
        <textarea rows="20" 
          ref="editInput"
          onKeyPress={this._onEdit}
          onChange={this._onEdit}
          >{data}</textarea>
        <button className="btn btn-primary" disabled={isDisabled} 
          onClick={this._onSubmit}>Update</button>
      </div>
    );
  },


  componentDidMount: function() {
    var self = this;

    $.ajax({
      url: '/admin/model/doc',
      data: {
        format: 'json',
        name: this.state.modelName,
        id: this.state.id,
      }
    })
      .done(function(data) {
        var doc = data.doc;

        // remove id attribute
        delete doc._id;

        self.setStateIfMounted({
          data: doc
        });
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      });
    ;
  },
});
