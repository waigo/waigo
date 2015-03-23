var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var RenderUtils = require('../../utils/renderUtils'),
  GuardedStateMixin = require('../../mixins/guardedState');


module.exports = React.createClass({
  mixins: [Router.State, GuardedStateMixin],

  getInitialState: function() {
    return {
      modelName: decodeURIComponent(this.getParams().key),
      loading: true,
      error: null,
    };
  },


  render: function() {
    var result = null;

    if (!this.state.columns) {
      result = (
        <div className="loading">Loading structure...</div>
      );
    } else {
      result = this._buildTable();
    }

    return (
      <div>
        {this.state.error ? RenderUtils.buildError(this.state.error) : ''}
        {result}
      </div>
    )
  },



  _buildTable: function() {
    var columns = this.state.columns,
      rows = this.state.rows || [];

    var header = columns.map( c => (<th>{c.name}</th>) );

    var body = null;
    if (this.state.loading) {
      body = (<tr><td className="loading">Loading</td></tr>);
    } else {
      body = rows.map(function(row) {
        var values = columns.map(function(col) {
          var v = row[col.name];

          // for now make everything a string
          if ('object' === typeof v) {
            v = JSON.stringify(v);
          }

          return (<td>{v}</td>);
        });

        return (<tr>{values}</tr>);
      });
    }

    return (
      <table>
        <thead><tr>{header}</tr></thead>
        <tbody>{body}</tbody>
      </table>
    );
  },


  _fetchRows: function() {
    var self = this;

    this.setState({
      loading: true
    });

    var columnNames = _.pluck(this.state.columns, 'name');

    $.ajax({
      url: '/admin/model/rows',
      data: {
        format: 'json',
        name: this.state.modelName,
        columns: columnNames,
      }
    })
      .done(function(data){        
        self.setStateIfMounted({
          rows: data.rows
        });
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      })
      .always(function() {
        self.setStateIfMounted({
          loading: false
        });
      })
    ;
  },


  componentDidMount: function() {
    var self = this;

    $.ajax({
      url: '/admin/model/columns',
      data: {
        format: 'json',
        name: this.state.modelName,
      }
    })
      .done(function(data) {
        self.setStateIfMounted({
          columns: data.columns
        });

        self._fetchRows();
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      });
    ;
  },

});

