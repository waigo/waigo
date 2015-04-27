var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Loader = require('../../components/loader'),
  Button = require('../../components/button'),
  JsonEditor  = require('../../components/jsonEditor'),
  Modal = require('../../components/modal'),
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


  _onSubmit: function(e) {
    e.preventDefault();

    var self = this;

    this.setState({
      submitting: true
    });

    $.ajax({
      method: 'PUT',
      url: `/admin/models/model/doc?format=json&name=${this.state.modelName}&id=${this.state.id}`,
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


  _onDelete: function(e) {
    this.refs.deleteModal.open();
  },


  _onDataChange: function(data) {
    try {
      var json = JSON.parse(data);

      // must not be empty object
      if (!json || !Object.keys(json).length) {
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
      <div>
        <JsonEditor 
          onChange={this._onDataChange}
          value={JSON.stringify(json, null, 2)}
          height="400px" />
        <div className="actions">
          <Button label="Update" disabled={!json} onClick={this._onSubmit} />
          <Button label="Delete" disabled={!json} color="red" onClick={this._onDelete} />
          <Modal ref="deleteModal" id="deleteDocModal">
            <span>test</span>
          </Modal>
        </div>
      </div>
    );
  },


  componentDidMount: function() {
    var self = this;

    $.ajax({
      url: '/admin/models/model/doc',
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
