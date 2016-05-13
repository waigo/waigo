var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Timer = require('clockmaker').Timer;

var _ = require('lodash'),
  Loader = require('../../components/loader'),
  RenderUtils = require('../../utils/renderUtils'),
  ModelTable = require('../../components/modelTable'),
  Button = require('../../components/button'),
  GuardedStateMixin = require('../../mixins/guardedState');


module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
    params: React.PropTypes.object,
  },

  mixins: [GuardedStateMixin],

  getInitialState: function() {
    return {
      modelName: decodeURIComponent(this.context.params.key),
      columns: null,
    };
  },


  _onRowClick: function(item) {
    this.context.router.push({
      pathname: `${this.context.params.key}/${item.id}`,
    });
  },


  _onAddClick: function() {
    this.context.router.push({
      pathname: `${this.context.params.key}/new`,
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
          <Link to="/">Collection</Link>
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

