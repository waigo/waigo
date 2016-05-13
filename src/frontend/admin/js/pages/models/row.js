var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Loader = require('../../components/loader'),
  Button = require('../../components/button'),
  CodeEditor = require('../../components/codeEditor'),
  Modal = require('../../components/modal'),
  RenderUtils = require('../../utils/renderUtils'),
  GuardedStateMixin = require('../../mixins/guardedState');


module.exports = React.createClass({
  contextTypes: {
    params: React.PropTypes.object,
    router: React.PropTypes.object,
  },

  mixins: [GuardedStateMixin],

  getInitialState: function() {
    var params = this.context.params;

    return {
      modelName: params.key,
      id: params.id,
      error: null,
      jsonStr: "{}",
    };
  },

  render: function() { 
    var editingForm = this._buildEditingForm();

    return (
      <div className="page-modelRow">
        <h2 className="title">
          <Link to={`/${this.state.modelName}`}>
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
    if (undefined === this.state.jsonStr) {
      return (<Loader text="Loading data" />);
    }

    var json = this.state.jsonStr;

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
        <CodeEditor 
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



  _onDataChange: function(jsonStr) {
    try {
      var json = JSON.parse(jsonStr);

      // must not be empty object
      if (!json || !Object.keys(json).length) {
        throw new Error();
      }

      this.setState({
        jsonStr: jsonStr
      });
    } catch (err) {
      this.setState({
        jsonStr: null
      });
    }
  },


  _load: function() {
    var self = this;

    // if creating a new item then no need to fetch data to start with
    if ('new' === this.state.id) {
      return this.setState({
        jsonStr: "{}"
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
        delete doc.id;

        self.setStateIfMounted({
          jsonStr: JSON.stringify(doc, null, 2)
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
        doc: this.state.jsonStr
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
        doc: this.state.jsonStr
      }
    })
      .then(function(data) {
        Materialize.toast('Create successful', 2000, 'rounded');

        var doc = JSON.parse(data.doc),
          id = doc.id;

        delete doc.id;

        self.setStateIfMounted({
          id: id,
          jsonStr: JSON.stringify(doc),
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

        self.context.router.push({
          pathname: self.context.params.key,
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
