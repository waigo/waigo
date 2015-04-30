var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Timer = require('clockmaker').Timer;

var _ = require('../../utils/lodash'),
  Loader = require('../../components/loader'),
  RenderUtils = require('../../utils/renderUtils'),
  JsonEditor  = require('../../components/jsonEditor'),
  Pagination = require('../../components/pagination'),
  Button = require('../../components/button'),
  SubmitButton = require('../../components/submitButton'),
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
      perPage: 10,
      filter: {},
      sort: {},
      page: 1,
      newFilter: {},
      newSort: {},
      newPerPage: 10,
    };
  },


  _onRowClick: function(e) {
    e.preventDefault();

    this.context.router.transitionTo('modelRow', {
      key: this.context.router.getCurrentParams().key,
      id: e.currentTarget.id
    });
  },


  _onAddClick: function(e) {
    this.context.router.transitionTo('modelRow', {
      key: this.context.router.getCurrentParams().key,
      id: 'new'
    });
  },



  _onPerPageChange: function(e) {
    try {
      var num = parseInt(e.currentTarget.value);

      if (Number.isNaN(num)) {
        throw new Error();
      }

      this.setState({
        newPerPage: num
      });
    } catch (err) {
      this.setState({
        newPerPage: null
      });            
    }
  },

  _onFilterChange: function(val) {
    try {
      this.setState({
        newFilter: JSON.parse(val)
      });
    } catch (err) {
      this.setState({
        newFilter: null
      });
    }
  },

  _onSortChange: function(val) {
    try {
      this.setState({
        newSort: JSON.parse(val),
      });
    } catch (err) {
      this.setState({
        newSort: null
      });
    }
  },

  _canSubmitSettingsForm: function() {
    return (null !== this.state.newFilter 
      && null !== this.state.newSort
      && null !== this.state.newPerPage
      );
  },

  _buildTableFilter: function() {
    var canSubmit = this._canSubmitSettingsForm();

    return (
      <div className="row">
        <div className="col s12 m7">
          <ul className="model-filters collapsible" ref="querySettings">
            <li>
              <div className="collapsible-header">
                <i className="fa fa-gear"></i>
                <span>Query settings</span>
              </div>
              <div className="collapsible-body">
                <form onSubmit={this._submitSettingsForm}>
                  <div className="filter">
                    <label>Filter:</label>
                    <JsonEditor 
                      value={this.state.newFilter}
                      onChange={this._onFilterChange}
                      height="100px"
                      width="200px" />
                  </div>
                  <div className="filter">
                    <label>Sort:</label>
                    <JsonEditor 
                      value={this.state.newSort}
                      onChange={this._onSortChange}
                      height="100px"
                      width="200px" />
                  </div>
                  <div className="filter">
                    <label>Per page:</label>
                    <input type="text" value={this.state.newPerPage} onChange={this._onPerPageChange} />
                  </div>
                  <div className="action">
                    <SubmitButton label="Apply" disabled={!canSubmit} />
                  </div>
                </form>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
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
            value = new Date(value).toString();
          }
          // else if value is an array
          else if (Array.isArray(value)) {
            // extract sub key
            if (col.subKey) {
              value = _.pluck(value, col.subKey);
            }

            // construct list
            value = value.map(function(v) {
              return (<li key={v}>{v}</li>);
            });

            value = (<ul>{value}</ul>);

          }
          // stringify objects
          else if ('object' === typeof value) {
            value = JSON.stringify(value);
          }

          return (<td key={col.name} dataFlipValue={flipValue}>{value}</td>);
        });

        return (<tr id={row._id} key={row._id} onClick={self._onRowClick}>{values}</tr>);
      });
    }

    var tableFilter = this._buildTableFilter();

    return (
      <div>
        {tableFilter}
        {RenderUtils.buildError(this.state.error)}
        <Pagination 
          currentPage={this.state.page}
          resultsPerPage={this.state.perPage}
          totalResults={this.state.totalRows}
          onSelectPage={this._onSelectPage} />
        <table className="hoverable bordered">
          <thead><tr>{header}</tr></thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    );
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
      result = this._buildTable();
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
    )
  },



  componentDidUpdate: function() {
    if (!this.state.querySettingsInitialised) {
      $(React.findDOMNode(this.refs.querySettings)).collapsible();

      this.setState({
        querySettingsInitialised: true
      });
    }
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

        self._fetchRows();
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      });
    ;
  },


  _submitSettingsForm: function(e) {
    e.preventDefault();

    // reset page
    this.setState({
      filter: this.state.newFilter,
      sort: this.state.newSort,
      perPage: this.state.newPerPage,
      page: 1
    });

    this._fetchRows();
  },


  _onSelectPage: function(newPage) {
    this.setState({
      page: newPage
    });

    this._fetchRows();
  },


  _fetchRows: function() {
    var self = this;

    // give time for values to propagate
    if (self._fetchRowsTimer) {
      self._fetchRowsTimer.stop();
    }

    self._fetchRowsTimer = Timer(function() {

      self.setState({
        loading: true,
        error: null,
      });

      var columnNames = _.pluck(self.state.columns, 'name');

      // fetch collection rows
      $.ajax({
        url: '/admin/models/model/rows?format=json',
        method: 'POST',
        data: {
          name: self.state.modelName,
          filter: JSON.stringify(self.state.filter),
          sort: JSON.stringify(self.state.sort),
          perPage: self.state.perPage,
          page: self.state.page,
        }
      })
        .done(function(data){        
          self.setStateIfMounted({
            totalRows: data.count,
            rows: data.rows,
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

    }, 200).start();

  },



});

