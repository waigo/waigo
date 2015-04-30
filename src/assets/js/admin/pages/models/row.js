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
        <h2 className="title">
          <Link to="model" params={{key: this.state.modelName}}>
            {this.state.modelName}
          </Link>
          <span> / {this.state.id}</span>
        </h2>
        {RenderUtils.buildError(this.state.error)}
        {editingForm}
      </div>
    );
  },


  componentDidMount: function() {
    this._load();
  },


  _buildEditingForm: function() {
    var json = this.state.json;

    if (undefined === json) {
      return (<Loader text="Loading data" />);
    }

    var deleteButton = null,
      saveBtnLabel = 'Create';

    if ('new' !== this.state.id) {
      saveBtnLabel = 'Update';

      deleteButton = (
        <Button label="Delete" color="red" onClick={this._showDeleteModal} />
      );
    }
    
    return (
      <div>
        <JsonEditor 
          onChange={this._onDataChange}
          value={json}
          height="400px" 
          ref="editor" />
        <div className="actions">
          <Button label={saveBtnLabel} disabled={!json} onClick={this._save} />
          {deleteButton}
        </div>
        <Modal 
          ref="deleteModal" 
          id="deleteDocModal" 
          actions={['Yes', 'No']}
          onAction={this._onDeleteModalAction}>
            <span>Are you sure you want to remove this document from the collection?</span>
        </Modal>
      </div>
    );
  },



  _onDataChange: function(data) {
    try {
      var json = JSON.parse(data);

      // must not be empty object
      if (!json || !Object.keys(json).length) {
        throw new Error();
      }

      this.setState({
        json: data
      });
    } catch (err) {
      this.setState({
        json: null
      });
    }
  },


  _load: function() {
    var self = this;

    // if creating a new item then no need to fetch data to start with
    if ('new' === this.state.id) {
      return this.setState({
        json: {}
      });
    }

    $.ajax({
      url: '/admin/models/model/doc',
      data: {
        format: 'json',
        name: this.state.modelName,
        id: this.state.id,
      }
    })
      .done(function(data) {
        var doc = JSON.parse(data.doc);

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


  _update: function() {
    var self = this;

    this.setState({
      submitting: true,
      error: null
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


  _create: function() {
    var self = this;

    this.setState({
      submitting: true,
      error: null
    });

    $.ajax({
      method: 'POST',
      url: `/admin/models/model/doc?format=json&name=${this.state.modelName}`,
      data: {
        doc: this.state.json
      }
    })
      .then(function(data) {
        Materialize.toast('Create successful', 2000, 'rounded');

        var doc = JSON.parse(data.doc),
          id = doc._id;

        delete doc._id;

        self.setStateIfMounted({
          id: id,
          json: doc,
        });
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



  _save: function() {
    if ('new' === this.state.id) {
      this._create();
    } else {
      this._update();
    }
  },



  _delete: function() {
    var self = this;

    this.setState({
      submitting: true,
      error: null,
    });

    $.ajax({
      method: 'DELETE',
      url: `/admin/models/model/doc?format=json&name=${this.state.modelName}&id=${this.state.id}`,
    })
      .then(function() {
        Materialize.toast('Delete successful', 2000, 'rounded');

        self.context.router.transitionTo('model', {
          key: self.context.router.getCurrentParams().key,
        });
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


  _showDeleteModal: function() {
    this.refs.deleteModal.open();
  },


  _onDeleteModalAction: function(action) {
    if ('yes' === action.toLowerCase()) {
      this._delete();
    }
  },




});
