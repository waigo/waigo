var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Timer = require('clockmaker').Timer;

var _ = require('lodash'),
  Loader = require('../components/loader'),
  RenderUtils = require('../utils/renderUtils'),
  ModelTable = require('../components/modelTable'),
  Button = require('../components/button'),
  GuardedStateMixin = require('../mixins/guardedState');


module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [GuardedStateMixin],

  getInitialState: function() {
    return {
      modelName: decodeURIComponent(this.context.router.getCurrentParams().key),
      columns: null,
    };
  },


  _onRowClick: function(item) {
    this.context.router.transitionTo('modelRow', {
      key: this.context.router.getCurrentParams().key,
      id: item._id
    });
  },


  _onAddClick: function() {
    this.context.router.transitionTo('modelRow', {
      key: this.context.router.getCurrentParams().key,
      id: 'new'
    });
  },


  render: function() {
    var result = null;

    if (!this.state.columns) {
      result = (
        <div>
          <Loader text="Loading structure" />
          {RenderUtils.buildError(this.state.error)}
        </div>
      );
    } else {
      result = (
        <ModelTable 
          modelName={this.state.modelName} 
          columns={this.state.columns} 
          onRowClick={this._onRowClick} />
      )
    }

    return (
      <div className="page-model">
        <Button icon="plus-circle" label="Add" className="add-button" onClick={this._onAddClick} />
        <h2>
          <Link to="models">Collection</Link>
          <span> / {this.state.modelName}</span>
        </h2>
        {result}
      </div>
    );
  },



  componentDidMount: function() {
    var self = this;

    // fetch column info
    $.ajax({
      url: '/admin/models/model/columns',
      data: {
        format: 'json',
        name: this.state.modelName,
      }
    })
      .done(function(data) {
        self.setStateIfMounted({
          columns: data.columns
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

