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
      loading: true,
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


  _buildEditingForm: function() {
    var data = JSON.stringify(this.state.data);

    return (
      <div>
        <textarea rows="20">{data}</textarea>
        <button className="btn btn-primary">Update</button>
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
        self.setStateIfMounted({
          data: data.doc
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
