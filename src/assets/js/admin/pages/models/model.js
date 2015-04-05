var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Loader = require('../../components/loader'),
  RenderUtils = require('../../utils/renderUtils'),
  GuardedStateMixin = require('../../mixins/guardedState');


module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [GuardedStateMixin],

  getInitialState: function() {
    return {
      modelName: decodeURIComponent(this.context.router.getCurrentParams().key),
      loading: true,
      error: null,
    };
  },


  render: function() {
    var result = null;

    if (!this.state.columns) {
      result = (
        <Loader text="Loading structure" />
      );
    } else {
      result = this._buildTable();
    }

    return (
      <div className="page-model">
        <h2>Collection: {this.state.modelName}</h2>
        {RenderUtils.buildError(this.state.error)}
        {result}
      </div>
    )
  },


  _onRowClick: function(e) {
    e.preventDefault();

    this.context.router.transitionTo('modelRow', {
      key: this.context.router.getCurrentParams().key,
      id: e.currentTarget.id
    });
  },



  _buildTable: function() {
    var self = this;

    var columns = this.state.columns,
      rows = this.state.rows || [];

    var header = columns.map( c => (<th>{c.name}</th>) );

    var body = null;
    if (this.state.loading) {
      body = (<tr><td><Loader /></td></tr>);
    } else {
      body = rows.map(function(row) {
        var values = columns.map(function(col) {
          
          var value = row[col.name],
            flipValue = null;

          // if value is a date
          if ('Date' === col.type) {
            flipValue = value;
            value = moment(value).fromNow();
          }
          // else if value is an array
          else if (_.isArray(value)) {
            // extract sub key
            if (col.subKey) {
              value = _.pluck(value, col.subKey);
            }

            // construct list
            value = _.map(value, function(v) {
              return (<li key={v}>{v}</li>);
            });

            value = (<ul>{value}</ul>);

          }
          // stringify objects
          else if (_.isObject(value)) {
            value = JSON.stringify(value);
          }

          return (<td key={col.name} dataFlipValue={flipValue}>{value}</td>);
        });

        return (<tr id={row._id} key={row._id} onClick={self._onRowClick}>{values}</tr>);
      });
    }

    return (
      <table className="hoverable bordered">
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

