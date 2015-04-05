var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Loader = require('../../components/loader'),
  SubmitBtn = require('../../components/submitButton'),
  JsonEditor  = require('../../components/jsonEditor'),
  RenderUtils = require('../../utils/renderUtils'),
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
    var editingForm = this._buildEditingForm();

    return (
      <div className="page-modelRow">
        <h2 className="title">{this.state.modelName}/{this.state.id}</h2>
        {RenderUtils.buildError(this.state.error)}
        {editingForm}
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


  _onSubmit: function(e) {
    e.preventDefault();

    var self = this;

    this.setState({
      submitting: true
    });

    $.ajax({
      method: 'PUT',
      url: `/admin/model/doc?format=json&name=${this.state.modelName}&id=${this.state.id}`,
      data: {
        doc: this.state.json
      }
    })
      .then(function() {
        Materialize.toast('Update successful', 2000, 'rounded');
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



  _onDataChange: function(data) {
    try {
      var json = JSON.parse(data);

      // must not be empty object
      if (!json || !_.keys(json)) {
        throw new Error();
      }

      this.setState({
        json: json
      });
    } catch (err) {
      this.setState({
        json: null
      });
    }
  },


  _buildEditingForm: function() {
    var json = this.state.json;

    if (undefined === json) {
      return (<Loader text="Loading data" />);
    }

    return (
      <form onSubmit={this._onSubmit}>
        <JsonEditor 
          name="docEditor" 
          onChange={this._onDataChange}
          value={JSON.stringify(json, null, 2)}
          height="400px" />
        <SubmitBtn label="Update" disabled={!json} />
      </form>
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
          json: doc
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
