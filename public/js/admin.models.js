webpackJsonp([2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var DefaultRoute = Router.DefaultRoute;
	var RouteHandler = Router.RouteHandler;
	var Route = Router.Route;
	
	var Models = __webpack_require__(214);
	var Model = __webpack_require__(215);
	var Row = __webpack_require__(216);
	
	var App = React.createClass({
	  displayName: "App",
	
	  render: function render() {
	    return React.createElement(RouteHandler, this.props);
	  }
	});
	
	var routes = React.createElement(
	  Route,
	  { handler: App },
	  React.createElement(DefaultRoute, { name: "models", handler: Models }),
	  React.createElement(Route, { name: "model", path: "/:key", handler: Model }),
	  React.createElement(Route, { name: "modelRow", path: "/:key/:id", handler: Row })
	);
	
	Router.run(routes, Router.HashLocation, function (Handler, state) {
	  React.render(React.createElement(Handler, { routes: state.routes, params: state.params, query: state.query }), document.getElementById("react-root"));
	});

/***/ },

/***/ 214:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	
	var Router = __webpack_require__(166),
	    Link = Router.Link;
	
	var FilterList = __webpack_require__(206),
	    RenderUtils = __webpack_require__(208);
	
	module.exports = React.createClass({
	  displayName: "exports",
	
	  render: function render() {
	    return React.createElement(
	      "div",
	      { className: "page-models" },
	      React.createElement(FilterList, {
	        ajaxUrl: "/admin/models?format=json",
	        ajaxResponseDataMapper: this._mapAjaxData,
	        itemDisplayNameFormatter: this._getItemDisplayName,
	        itemRoute: "model" })
	    );
	  },
	
	  _mapAjaxData: function _mapAjaxData(data) {
	    data = data || {};
	
	    return (data.models || []).map(function (r) {
	      return {
	        key: r,
	        name: r };
	    });
	  },
	
	  _getItemDisplayName: function _getItemDisplayName(item) {
	    return React.createElement(
	      "span",
	      null,
	      item.name
	    );
	  } });

/***/ },

/***/ 215:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var Link = Router.Link;
	
	var Timer = __webpack_require__(1).Timer;
	
	var _ = __webpack_require__(213),
	    Loader = __webpack_require__(207),
	    RenderUtils = __webpack_require__(208),
	    JsonEditor = __webpack_require__(210),
	    Pagination = __webpack_require__(211),
	    SubmitButton = __webpack_require__(212),
	    GuardedStateMixin = __webpack_require__(209);
	
	module.exports = React.createClass({
	  displayName: "exports",
	
	  contextTypes: {
	    router: React.PropTypes.func
	  },
	
	  mixins: [GuardedStateMixin],
	
	  getInitialState: function getInitialState() {
	    return {
	      modelName: decodeURIComponent(this.context.router.getCurrentParams().key),
	      loading: true,
	      error: null,
	      limit: 10,
	      filter: {},
	      sort: {},
	      page: 1 };
	  },
	
	  _onRowClick: function _onRowClick(e) {
	    e.preventDefault();
	
	    this.context.router.transitionTo("modelRow", {
	      key: this.context.router.getCurrentParams().key,
	      id: e.currentTarget.id
	    });
	  },
	
	  _onLimitChange: function _onLimitChange(e) {
	    try {
	      this.setState({
	        limit: parseInt(e.currentTarget.value)
	      });
	    } catch (err) {
	      this.setState({
	        limit: null
	      });
	    }
	  },
	
	  _onFilterChange: function _onFilterChange(val) {
	    try {
	      this.setState({
	        filter: JSON.parse(val) });
	    } catch (err) {
	      this.setState({
	        filter: null });
	    }
	  },
	
	  _onSortChange: function _onSortChange(val) {
	    try {
	      this.setState({
	        sort: JSON.parse(val) });
	    } catch (err) {
	      this.setState({
	        sort: null });
	    }
	  },
	
	  _isQueryValid: function _isQueryValid() {
	    return null !== this.state.filter && null !== this.state.sort && null !== this.state.limit;
	  },
	
	  _buildTableFilter: function _buildTableFilter() {
	    var isQueryValid = this._isQueryValid();
	
	    var canRefreshResults = this.state.filter && this.state.limit && this.state.sort;
	
	    return React.createElement(
	      "div",
	      { className: "row" },
	      React.createElement(
	        "div",
	        { className: "col s12 m7" },
	        React.createElement(
	          "ul",
	          { className: "model-filters collapsible", ref: "querySettings" },
	          React.createElement(
	            "li",
	            null,
	            React.createElement(
	              "div",
	              { className: "collapsible-header active" },
	              React.createElement("i", { className: "fa fa-gear" }),
	              React.createElement(
	                "span",
	                null,
	                "Query settings"
	              )
	            ),
	            React.createElement(
	              "div",
	              { className: "collapsible-body" },
	              React.createElement(
	                "form",
	                { onSubmit: this._submitSettingsForm },
	                React.createElement(
	                  "div",
	                  { className: "filter" },
	                  React.createElement(
	                    "label",
	                    null,
	                    "Filter:"
	                  ),
	                  React.createElement(JsonEditor, {
	                    value: "{}",
	                    onChange: this._onFilterChange,
	                    height: "100px",
	                    width: "200px" })
	                ),
	                React.createElement(
	                  "div",
	                  { className: "filter" },
	                  React.createElement(
	                    "label",
	                    null,
	                    "Sort:"
	                  ),
	                  React.createElement(JsonEditor, {
	                    value: "{}",
	                    onChange: this._onSortChange,
	                    height: "100px",
	                    width: "200px" })
	                ),
	                React.createElement(
	                  "div",
	                  { className: "filter" },
	                  React.createElement(
	                    "label",
	                    null,
	                    "Limit:"
	                  ),
	                  React.createElement("input", { type: "text", value: "10", onChange: this._onLimitChange })
	                ),
	                React.createElement(
	                  "div",
	                  { className: "action" },
	                  React.createElement(SubmitButton, { label: "Apply", disabled: !canRefreshResults })
	                )
	              )
	            )
	          )
	        )
	      )
	    );
	  },
	
	  _buildTable: function _buildTable() {
	    var self = this;
	
	    var columns = this.state.columns,
	        rows = this.state.rows || [];
	
	    var header = columns.map(function (c) {
	      return React.createElement(
	        "th",
	        null,
	        c.name
	      );
	    });
	
	    var body = null;
	    if (this.state.loading) {
	      body = React.createElement(
	        "tr",
	        null,
	        React.createElement(
	          "td",
	          null,
	          React.createElement(Loader, null)
	        )
	      );
	    } else {
	      body = rows.map(function (row) {
	        var values = columns.map(function (col) {
	
	          var value = row[col.name],
	              flipValue = null;
	
	          // if value is a date
	          if ("Date" === col.type) {
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
	            value = value.map(function (v) {
	              return React.createElement(
	                "li",
	                { key: v },
	                v
	              );
	            });
	
	            value = React.createElement(
	              "ul",
	              null,
	              value
	            );
	          }
	          // stringify objects
	          else if ("object" === typeof value) {
	            value = JSON.stringify(value);
	          }
	
	          return React.createElement(
	            "td",
	            { key: col.name, dataFlipValue: flipValue },
	            value
	          );
	        });
	
	        return React.createElement(
	          "tr",
	          { id: row._id, key: row._id, onClick: self._onRowClick },
	          values
	        );
	      });
	    }
	
	    var tableFilter = this._buildTableFilter();
	
	    return React.createElement(
	      "div",
	      null,
	      tableFilter,
	      React.createElement(Pagination, {
	        currentPage: this.state.page,
	        resultsPerPage: this.state.limit,
	        totalResults: this.state.totalRows,
	        onSelectPage: this._onSelectPage }),
	      React.createElement(
	        "table",
	        { className: "hoverable bordered" },
	        React.createElement(
	          "thead",
	          null,
	          React.createElement(
	            "tr",
	            null,
	            header
	          )
	        ),
	        React.createElement(
	          "tbody",
	          null,
	          body
	        )
	      )
	    );
	  },
	
	  render: function render() {
	    var result = null;
	
	    if (!this.state.columns) {
	      result = React.createElement(Loader, { text: "Loading structure" });
	    } else {
	      result = this._buildTable();
	    }
	
	    return React.createElement(
	      "div",
	      { className: "page-model" },
	      React.createElement(
	        "h2",
	        null,
	        "Collection: ",
	        this.state.modelName
	      ),
	      RenderUtils.buildError(this.state.error),
	      result
	    );
	  },
	
	  componentDidUpdate: function componentDidUpdate() {
	    if (!this.state.querySettingsInitialised) {
	      $(React.findDOMNode(this.refs.querySettings)).collapsible();
	
	      this.setState({
	        querySettingsInitialised: true
	      });
	    }
	  },
	
	  componentDidMount: function componentDidMount() {
	    var self = this;
	
	    // fetch column info
	    $.ajax({
	      url: "/admin/models/model/columns",
	      data: {
	        format: "json",
	        name: this.state.modelName }
	    }).done(function (data) {
	      self.setStateIfMounted({
	        columns: data.columns
	      });
	
	      self._fetchRows();
	    }).fail(function (xhr) {
	      self.setStateIfMounted({
	        error: xhr
	      });
	    });
	    ;
	  },
	
	  _submitSettingsForm: function _submitSettingsForm(e) {
	    e.preventDefault();
	
	    // reset page
	    this.setState({
	      page: 1
	    });
	
	    this._fetchRows();
	  },
	
	  _onSelectPage: function _onSelectPage(newPage) {
	    this.setState({
	      page: newPage
	    });
	
	    this._fetchRows();
	  },
	
	  _fetchRows: function _fetchRows() {
	    var self = this;
	
	    // give time for values to propagate
	    if (self._fetchRowsTimer) {
	      self._fetchRowsTimer.stop();
	    }
	
	    self._fetchRowsTimer = Timer(function () {
	
	      self.setState({
	        loading: true,
	        error: null });
	
	      var columnNames = _.pluck(self.state.columns, "name");
	
	      // fetch collection rows
	      $.ajax({
	        url: "/admin/models/model/rows?format=json",
	        method: "POST",
	        data: {
	          name: self.state.modelName,
	          filter: JSON.stringify(self.state.filter),
	          sort: JSON.stringify(self.state.sort),
	          perPage: self.state.limit,
	          page: self.state.page }
	      }).done(function (data) {
	        self.setStateIfMounted({
	          totalRows: data.count,
	          rows: data.rows });
	      }).fail(function (xhr) {
	        self.setStateIfMounted({
	          error: xhr
	        });
	      }).always(function () {
	        self.setStateIfMounted({
	          loading: false
	        });
	      });
	    }, 200).start();
	  } });

/***/ },

/***/ 216:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(2)["default"];
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var Link = Router.Link;
	
	var Loader = __webpack_require__(207),
	    SubmitBtn = __webpack_require__(212),
	    JsonEditor = __webpack_require__(210),
	    RenderUtils = __webpack_require__(208),
	    GuardedStateMixin = __webpack_require__(209);
	
	module.exports = React.createClass({
	  displayName: "exports",
	
	  contextTypes: {
	    router: React.PropTypes.func
	  },
	
	  mixins: [GuardedStateMixin],
	
	  getInitialState: function getInitialState() {
	    var params = this.context.router.getCurrentParams();
	
	    return {
	      modelName: decodeURIComponent(params.key),
	      id: decodeURIComponent(params.id),
	      error: null };
	  },
	
	  render: function render() {
	    var editingForm = this._buildEditingForm();
	
	    return React.createElement(
	      "div",
	      { className: "page-modelRow" },
	      React.createElement(
	        "h2",
	        { className: "title" },
	        this.state.modelName,
	        "/",
	        this.state.id
	      ),
	      RenderUtils.buildError(this.state.error),
	      editingForm
	    );
	  },
	
	  _onEdit: function _onEdit(e) {
	    this.setState({
	      edit: this._getLatestEdit()
	    });
	  },
	
	  _getLatestEdit: function _getLatestEdit() {
	    return React.findDOMNode(this.refs.editInput).value;
	  },
	
	  _onSubmit: function _onSubmit(e) {
	    e.preventDefault();
	
	    var self = this;
	
	    this.setState({
	      submitting: true
	    });
	
	    $.ajax({
	      method: "PUT",
	      url: "/admin/models/model/doc?format=json&name=" + this.state.modelName + "&id=" + this.state.id,
	      data: {
	        doc: this.state.json
	      }
	    }).then(function () {
	      Materialize.toast("Update successful", 2000, "rounded");
	    }).fail(function (xhr) {
	      self.setStateIfMounted({
	        error: xhr
	      });
	    }).always(function () {
	      self.setStateIfMounted({
	        submitting: false
	      });
	    });
	  },
	
	  _onDataChange: function _onDataChange(data) {
	    try {
	      var json = JSON.parse(data);
	
	      // must not be empty object
	      if (!json || !_core.Object.keys(json).length) {
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
	
	  _buildEditingForm: function _buildEditingForm() {
	    var json = this.state.json;
	
	    if (undefined === json) {
	      return React.createElement(Loader, { text: "Loading data" });
	    }
	
	    return React.createElement(
	      "form",
	      { onSubmit: this._onSubmit },
	      React.createElement(JsonEditor, {
	        onChange: this._onDataChange,
	        value: JSON.stringify(json, null, 2),
	        height: "400px" }),
	      React.createElement(SubmitBtn, { label: "Update", disabled: !json })
	    );
	  },
	
	  componentDidMount: function componentDidMount() {
	    var self = this;
	
	    $.ajax({
	      url: "/admin/models/model/doc",
	      data: {
	        format: "json",
	        name: this.state.modelName,
	        id: this.state.id }
	    }).done(function (data) {
	      var doc = data.doc;
	
	      // remove id attribute
	      delete doc._id;
	
	      self.setStateIfMounted({
	        json: doc
	      });
	    }).fail(function (xhr) {
	      self.setStateIfMounted({
	        error: xhr
	      });
	    });
	    ;
	  } });

/***/ }

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvYXBwLmpzIiwid2VicGFjazovLy8uL3BhZ2VzL21vZGVscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcGFnZXMvbW9kZWxzL3Jvdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGFBQVksQ0FBQzs7QUFFYixLQUFJLEtBQUssR0FBRyxtQkFBTyxDQUFDLEVBQU8sQ0FBQyxDQUFDO0FBQzdCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsR0FBYyxDQUFDLENBQUM7QUFDckMsS0FBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2QyxLQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLEtBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRXpCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsR0FBUyxDQUFDLENBQUM7QUFDaEMsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxHQUFTLENBQUMsQ0FBQztBQUMvQixLQUFJLEdBQUcsR0FBRyxtQkFBTyxDQUFDLEdBQU8sQ0FBQyxDQUFDOztBQUUzQixLQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQzVCLEdBQUUsV0FBVyxFQUFFLEtBQUs7O0dBRWxCLE1BQU0sRUFBRSxTQUFTLE1BQU0sR0FBRztLQUN4QixPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0RDtBQUNILEVBQUMsQ0FBQyxDQUFDOztBQUVILEtBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhO0dBQzlCLEtBQUs7R0FDTCxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUU7R0FDaEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFF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QUMsQ0FBQztTQUNwQyxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUM7T0FDcEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO01BQ3JFLENBQUM7QUFDTixJQUFHOztHQUVELGlCQUFpQixFQUFFLFNBQVMsaUJBQWlCLEdBQUc7QUFDbEQsS0FBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7O0tBRWhCLENBQUMsQ0FBQyxJQUFJLENBQUM7T0FDTCxHQUFHLEVBQUUseUJBQXlCO09BQzlCLElBQUksRUFBRTtTQUNKLE1BQU0sRUFBRSxNQUFNO1NBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztTQUMxQixFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUU7TUFDdEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRTtBQUM1QixPQUFNLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDekI7O0FBRUEsT0FBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUM7O09BRWYsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ3JCLElBQUksRUFBRSxHQUFHO1FBQ1YsQ0FBQyxDQUFDO01BQ0osQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRTtPQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUM7U0FDckIsS0FBSyxFQUFFLEdBQUc7UUFDWCxDQUFDLENBQUM7TUFDSixDQUFDLENBQUM7S0FDSCxDQUFDO0lBQ0YsRUFBRSxDQUFDLEMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xudmFyIFJvdXRlciA9IHJlcXVpcmUoXCJyZWFjdC1yb3V0ZXJcIik7XG52YXIgRGVmYXVsdFJvdXRlID0gUm91dGVyLkRlZmF1bHRSb3V0ZTtcbnZhciBSb3V0ZUhhbmRsZXIgPSBSb3V0ZXIuUm91dGVIYW5kbGVyO1xudmFyIFJvdXRlID0gUm91dGVyLlJvdXRlO1xuXG52YXIgTW9kZWxzID0gcmVxdWlyZShcIi4vaW5kZXhcIik7XG52YXIgTW9kZWwgPSByZXF1aXJlKFwiLi9tb2RlbFwiKTtcbnZhciBSb3cgPSByZXF1aXJlKFwiLi9yb3dcIik7XG5cbnZhciBBcHAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiBcIkFwcFwiLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFJvdXRlSGFuZGxlciwgdGhpcy5wcm9wcyk7XG4gIH1cbn0pO1xuXG52YXIgcm91dGVzID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgUm91dGUsXG4gIHsgaGFuZGxlcjogQXBwIH0sXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGVmYXVsdFJvdXRlLCB7IG5hbWU6IFwibW9kZWxzXCIsIGhhbmRsZXI6IE1vZGVscyB9KSxcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChSb3V0ZSwgeyBuYW1lOiBcIm1vZGVsXCIsIHBhdGg6IFwiLzprZXlcIiwgaGFuZGxlcjogTW9kZWwgfSksXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUm91dGUsIHsgbmFtZTogXCJtb2RlbFJvd1wiLCBwYXRoOiBcIi86a2V5LzppZFwiLCBoYW5kbGVyOiBSb3cgfSlcbik7XG5cblJvdXRlci5ydW4ocm91dGVzLCBSb3V0ZXIuSGFzaExvY2F0aW9uLCBmdW5jdGlvbiAoSGFuZGxlciwgc3RhdGUpIHtcbiAgUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQoSGFuZGxlciwgeyByb3V0ZXM6IHN0YXRlLnJvdXRlcywgcGFyYW1zOiBzdGF0ZS5wYXJhbXMsIHF1ZXJ5OiBzdGF0ZS5xdWVyeSB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWFjdC1yb290XCIpKTtcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC9Vc2Vycy9yYW0vZGV2L2pzL3dhaWdvLWZyYW1ld29yay93YWlnby9+L2JhYmVsLWxvYWRlcj9leHBlcmltZW50YWwmb3B0aW9uYWw9cnVudGltZSEuL3BhZ2VzL21vZGVscy9hcHAuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKSxcbiAgICBMaW5rID0gUm91dGVyLkxpbms7XG5cbnZhciBGaWx0ZXJMaXN0ID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvZmlsdGVyTGlzdFwiKSxcbiAgICBSZW5kZXJVdGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9yZW5kZXJVdGlsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiBcImV4cG9ydHNcIixcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJwYWdlLW1vZGVsc1wiIH0sXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEZpbHRlckxpc3QsIHtcbiAgICAgICAgYWpheFVybDogXCIvYWRtaW4vbW9kZWxzP2Zvcm1hdD1qc29uXCIsXG4gICAgICAgIGFqYXhSZXNwb25zZURhdGFNYXBwZXI6IHRoaXMuX21hcEFqYXhEYXRhLFxuICAgICAgICBpdGVtRGlzcGxheU5hbWVGb3JtYXR0ZXI6IHRoaXMuX2dldEl0ZW1EaXNwbGF5TmFtZSxcbiAgICAgICAgaXRlbVJvdXRlOiBcIm1vZGVsXCIgfSlcbiAgICApO1xuICB9LFxuXG4gIF9tYXBBamF4RGF0YTogZnVuY3Rpb24gX21hcEFqYXhEYXRhKGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YSB8fCB7fTtcblxuICAgIHJldHVybiAoZGF0YS5tb2RlbHMgfHwgW10pLm1hcChmdW5jdGlvbiAocikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiByLFxuICAgICAgICBuYW1lOiByIH07XG4gICAgfSk7XG4gIH0sXG5cbiAgX2dldEl0ZW1EaXNwbGF5TmFtZTogZnVuY3Rpb24gX2dldEl0ZW1EaXNwbGF5TmFtZShpdGVtKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcInNwYW5cIixcbiAgICAgIG51bGwsXG4gICAgICBpdGVtLm5hbWVcbiAgICApO1xuICB9IH0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC9Vc2Vycy9yYW0vZGV2L2pzL3dhaWdvLWZyYW1ld29yay93YWlnby9+L2JhYmVsLWxvYWRlcj9leHBlcmltZW50YWwmb3B0aW9uYWw9cnVudGltZSEuL3BhZ2VzL21vZGVscy9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKTtcbnZhciBMaW5rID0gUm91dGVyLkxpbms7XG5cbnZhciBUaW1lciA9IHJlcXVpcmUoXCJjbG9ja21ha2VyXCIpLlRpbWVyO1xuXG52YXIgXyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9sb2Rhc2hcIiksXG4gICAgTG9hZGVyID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvbG9hZGVyXCIpLFxuICAgIFJlbmRlclV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL3JlbmRlclV0aWxzXCIpLFxuICAgIEpzb25FZGl0b3IgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9qc29uRWRpdG9yXCIpLFxuICAgIFBhZ2luYXRpb24gPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9wYWdpbmF0aW9uXCIpLFxuICAgIFN1Ym1pdEJ1dHRvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL3N1Ym1pdEJ1dHRvblwiKSxcbiAgICBHdWFyZGVkU3RhdGVNaXhpbiA9IHJlcXVpcmUoXCIuLi8uLi9taXhpbnMvZ3VhcmRlZFN0YXRlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIGNvbnRleHRUeXBlczoge1xuICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICBtaXhpbnM6IFtHdWFyZGVkU3RhdGVNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsTmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmtleSksXG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBsaW1pdDogMTAsXG4gICAgICBmaWx0ZXI6IHt9LFxuICAgICAgc29ydDoge30sXG4gICAgICBwYWdlOiAxIH07XG4gIH0sXG5cbiAgX29uUm93Q2xpY2s6IGZ1bmN0aW9uIF9vblJvd0NsaWNrKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmNvbnRleHQucm91dGVyLnRyYW5zaXRpb25UbyhcIm1vZGVsUm93XCIsIHtcbiAgICAgIGtleTogdGhpcy5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkua2V5LFxuICAgICAgaWQ6IGUuY3VycmVudFRhcmdldC5pZFxuICAgIH0pO1xuICB9LFxuXG4gIF9vbkxpbWl0Q2hhbmdlOiBmdW5jdGlvbiBfb25MaW1pdENoYW5nZShlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsaW1pdDogcGFyc2VJbnQoZS5jdXJyZW50VGFyZ2V0LnZhbHVlKVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbGltaXQ6IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfb25GaWx0ZXJDaGFuZ2U6IGZ1bmN0aW9uIF9vbkZpbHRlckNoYW5nZSh2YWwpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGZpbHRlcjogSlNPTi5wYXJzZSh2YWwpIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGZpbHRlcjogbnVsbCB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX29uU29ydENoYW5nZTogZnVuY3Rpb24gX29uU29ydENoYW5nZSh2YWwpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNvcnQ6IEpTT04ucGFyc2UodmFsKSB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzb3J0OiBudWxsIH0pO1xuICAgIH1cbiAgfSxcblxuICBfaXNRdWVyeVZhbGlkOiBmdW5jdGlvbiBfaXNRdWVyeVZhbGlkKCkge1xuICAgIHJldHVybiBudWxsICE9PSB0aGlzLnN0YXRlLmZpbHRlciAmJiBudWxsICE9PSB0aGlzLnN0YXRlLnNvcnQgJiYgbnVsbCAhPT0gdGhpcy5zdGF0ZS5saW1pdDtcbiAgfSxcblxuICBfYnVpbGRUYWJsZUZpbHRlcjogZnVuY3Rpb24gX2J1aWxkVGFibGVGaWx0ZXIoKSB7XG4gICAgdmFyIGlzUXVlcnlWYWxpZCA9IHRoaXMuX2lzUXVlcnlWYWxpZCgpO1xuXG4gICAgdmFyIGNhblJlZnJlc2hSZXN1bHRzID0gdGhpcy5zdGF0ZS5maWx0ZXIgJiYgdGhpcy5zdGF0ZS5saW1pdCAmJiB0aGlzLnN0YXRlLnNvcnQ7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJyb3dcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sIHMxMiBtN1wiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJ1bFwiLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIm1vZGVsLWZpbHRlcnMgY29sbGFwc2libGVcIiwgcmVmOiBcInF1ZXJ5U2V0dGluZ3NcIiB9LFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sbGFwc2libGUtaGVhZGVyIGFjdGl2ZVwiIH0sXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHsgY2xhc3NOYW1lOiBcImZhIGZhLWdlYXJcIiB9KSxcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFwiUXVlcnkgc2V0dGluZ3NcIlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sbGFwc2libGUtYm9keVwiIH0sXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJmb3JtXCIsXG4gICAgICAgICAgICAgICAgeyBvblN1Ym1pdDogdGhpcy5fc3VibWl0U2V0dGluZ3NGb3JtIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIkZpbHRlcjpcIlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJ7fVwiLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5fb25GaWx0ZXJDaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogXCIxMDBweFwiLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCIyMDBweFwiIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImZpbHRlclwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydDpcIlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJ7fVwiLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5fb25Tb3J0Q2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwcHhcIixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMjAwcHhcIiB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIkxpbWl0OlwiXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBcIjEwXCIsIG9uQ2hhbmdlOiB0aGlzLl9vbkxpbWl0Q2hhbmdlIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImFjdGlvblwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFN1Ym1pdEJ1dHRvbiwgeyBsYWJlbDogXCJBcHBseVwiLCBkaXNhYmxlZDogIWNhblJlZnJlc2hSZXN1bHRzIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBfYnVpbGRUYWJsZTogZnVuY3Rpb24gX2J1aWxkVGFibGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLnN0YXRlLmNvbHVtbnMsXG4gICAgICAgIHJvd3MgPSB0aGlzLnN0YXRlLnJvd3MgfHwgW107XG5cbiAgICB2YXIgaGVhZGVyID0gY29sdW1ucy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcInRoXCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGMubmFtZVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHZhciBib2R5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICBib2R5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJ0clwiLFxuICAgICAgICBudWxsLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGRcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCBudWxsKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBib2R5ID0gcm93cy5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgdmFsdWVzID0gY29sdW1ucy5tYXAoZnVuY3Rpb24gKGNvbCkge1xuXG4gICAgICAgICAgdmFyIHZhbHVlID0gcm93W2NvbC5uYW1lXSxcbiAgICAgICAgICAgICAgZmxpcFZhbHVlID0gbnVsbDtcblxuICAgICAgICAgIC8vIGlmIHZhbHVlIGlzIGEgZGF0ZVxuICAgICAgICAgIGlmIChcIkRhdGVcIiA9PT0gY29sLnR5cGUpIHtcbiAgICAgICAgICAgIGZsaXBWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSkudG9TdHJpbmcoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBpZiB2YWx1ZSBpcyBhbiBhcnJheVxuICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAvLyBleHRyYWN0IHN1YiBrZXlcbiAgICAgICAgICAgIGlmIChjb2wuc3ViS2V5KSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gXy5wbHVjayh2YWx1ZSwgY29sLnN1YktleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnN0cnVjdCBsaXN0XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHYgfSxcbiAgICAgICAgICAgICAgICB2XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICBcInVsXCIsXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdHJpbmdpZnkgb2JqZWN0c1xuICAgICAgICAgIGVsc2UgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICB7IGtleTogY29sLm5hbWUsIGRhdGFGbGlwVmFsdWU6IGZsaXBWYWx1ZSB9LFxuICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgeyBpZDogcm93Ll9pZCwga2V5OiByb3cuX2lkLCBvbkNsaWNrOiBzZWxmLl9vblJvd0NsaWNrIH0sXG4gICAgICAgICAgdmFsdWVzXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdGFibGVGaWx0ZXIgPSB0aGlzLl9idWlsZFRhYmxlRmlsdGVyKCk7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICBudWxsLFxuICAgICAgdGFibGVGaWx0ZXIsXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFBhZ2luYXRpb24sIHtcbiAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuc3RhdGUucGFnZSxcbiAgICAgICAgcmVzdWx0c1BlclBhZ2U6IHRoaXMuc3RhdGUubGltaXQsXG4gICAgICAgIHRvdGFsUmVzdWx0czogdGhpcy5zdGF0ZS50b3RhbFJvd3MsXG4gICAgICAgIG9uU2VsZWN0UGFnZTogdGhpcy5fb25TZWxlY3RQYWdlIH0pLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJob3ZlcmFibGUgYm9yZGVyZWRcIiB9LFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGhlYWRcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgaGVhZGVyXG4gICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGJvZHlcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuY29sdW1ucykge1xuICAgICAgcmVzdWx0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgdGV4dDogXCJMb2FkaW5nIHN0cnVjdHVyZVwiIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9idWlsZFRhYmxlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBjbGFzc05hbWU6IFwicGFnZS1tb2RlbFwiIH0sXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImgyXCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIFwiQ29sbGVjdGlvbjogXCIsXG4gICAgICAgIHRoaXMuc3RhdGUubW9kZWxOYW1lXG4gICAgICApLFxuICAgICAgUmVuZGVyVXRpbHMuYnVpbGRFcnJvcih0aGlzLnN0YXRlLmVycm9yKSxcbiAgICAgIHJlc3VsdFxuICAgICk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnF1ZXJ5U2V0dGluZ3NJbml0aWFsaXNlZCkge1xuICAgICAgJChSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucXVlcnlTZXR0aW5ncykpLmNvbGxhcHNpYmxlKCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBxdWVyeVNldHRpbmdzSW5pdGlhbGlzZWQ6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gZmV0Y2ggY29sdW1uIGluZm9cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvY29sdW1uc1wiLFxuICAgICAgZGF0YToge1xuICAgICAgICBmb3JtYXQ6IFwianNvblwiLFxuICAgICAgICBuYW1lOiB0aGlzLnN0YXRlLm1vZGVsTmFtZSB9XG4gICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1uc1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX2ZldGNoUm93cygpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIDtcbiAgfSxcblxuICBfc3VibWl0U2V0dGluZ3NGb3JtOiBmdW5jdGlvbiBfc3VibWl0U2V0dGluZ3NGb3JtKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyByZXNldCBwYWdlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwYWdlOiAxXG4gICAgfSk7XG5cbiAgICB0aGlzLl9mZXRjaFJvd3MoKTtcbiAgfSxcblxuICBfb25TZWxlY3RQYWdlOiBmdW5jdGlvbiBfb25TZWxlY3RQYWdlKG5ld1BhZ2UpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHBhZ2U6IG5ld1BhZ2VcbiAgICB9KTtcblxuICAgIHRoaXMuX2ZldGNoUm93cygpO1xuICB9LFxuXG4gIF9mZXRjaFJvd3M6IGZ1bmN0aW9uIF9mZXRjaFJvd3MoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gZ2l2ZSB0aW1lIGZvciB2YWx1ZXMgdG8gcHJvcGFnYXRlXG4gICAgaWYgKHNlbGYuX2ZldGNoUm93c1RpbWVyKSB7XG4gICAgICBzZWxmLl9mZXRjaFJvd3NUaW1lci5zdG9wKCk7XG4gICAgfVxuXG4gICAgc2VsZi5fZmV0Y2hSb3dzVGltZXIgPSBUaW1lcihmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICBlcnJvcjogbnVsbCB9KTtcblxuICAgICAgdmFyIGNvbHVtbk5hbWVzID0gXy5wbHVjayhzZWxmLnN0YXRlLmNvbHVtbnMsIFwibmFtZVwiKTtcblxuICAgICAgLy8gZmV0Y2ggY29sbGVjdGlvbiByb3dzXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9yb3dzP2Zvcm1hdD1qc29uXCIsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBuYW1lOiBzZWxmLnN0YXRlLm1vZGVsTmFtZSxcbiAgICAgICAgICBmaWx0ZXI6IEpTT04uc3RyaW5naWZ5KHNlbGYuc3RhdGUuZmlsdGVyKSxcbiAgICAgICAgICBzb3J0OiBKU09OLnN0cmluZ2lmeShzZWxmLnN0YXRlLnNvcnQpLFxuICAgICAgICAgIHBlclBhZ2U6IHNlbGYuc3RhdGUubGltaXQsXG4gICAgICAgICAgcGFnZTogc2VsZi5zdGF0ZS5wYWdlIH1cbiAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgICAgdG90YWxSb3dzOiBkYXRhLmNvdW50LFxuICAgICAgICAgIHJvd3M6IGRhdGEucm93cyB9KTtcbiAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgICBlcnJvcjogeGhyXG4gICAgICAgIH0pO1xuICAgICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgICAgbG9hZGluZzogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCAyMDApLnN0YXJ0KCk7XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL21vZGVsLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY29yZSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanNcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKTtcbnZhciBMaW5rID0gUm91dGVyLkxpbms7XG5cbnZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9sb2FkZXJcIiksXG4gICAgU3VibWl0QnRuID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvc3VibWl0QnV0dG9uXCIpLFxuICAgIEpzb25FZGl0b3IgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9qc29uRWRpdG9yXCIpLFxuICAgIFJlbmRlclV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL3JlbmRlclV0aWxzXCIpLFxuICAgIEd1YXJkZWRTdGF0ZU1peGluID0gcmVxdWlyZShcIi4uLy4uL21peGlucy9ndWFyZGVkU3RhdGVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJleHBvcnRzXCIsXG5cbiAgY29udGV4dFR5cGVzOiB7XG4gICAgcm91dGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICB9LFxuXG4gIG1peGluczogW0d1YXJkZWRTdGF0ZU1peGluXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICB2YXIgcGFyYW1zID0gdGhpcy5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbW9kZWxOYW1lOiBkZWNvZGVVUklDb21wb25lbnQocGFyYW1zLmtleSksXG4gICAgICBpZDogZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5pZCksXG4gICAgICBlcnJvcjogbnVsbCB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBlZGl0aW5nRm9ybSA9IHRoaXMuX2J1aWxkRWRpdGluZ0Zvcm0oKTtcblxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJkaXZcIixcbiAgICAgIHsgY2xhc3NOYW1lOiBcInBhZ2UtbW9kZWxSb3dcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJoMlwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJ0aXRsZVwiIH0sXG4gICAgICAgIHRoaXMuc3RhdGUubW9kZWxOYW1lLFxuICAgICAgICBcIi9cIixcbiAgICAgICAgdGhpcy5zdGF0ZS5pZFxuICAgICAgKSxcbiAgICAgIFJlbmRlclV0aWxzLmJ1aWxkRXJyb3IodGhpcy5zdGF0ZS5lcnJvciksXG4gICAgICBlZGl0aW5nRm9ybVxuICAgICk7XG4gIH0sXG5cbiAgX29uRWRpdDogZnVuY3Rpb24gX29uRWRpdChlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBlZGl0OiB0aGlzLl9nZXRMYXRlc3RFZGl0KClcbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0TGF0ZXN0RWRpdDogZnVuY3Rpb24gX2dldExhdGVzdEVkaXQoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5lZGl0SW5wdXQpLnZhbHVlO1xuICB9LFxuXG4gIF9vblN1Ym1pdDogZnVuY3Rpb24gX29uU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHN1Ym1pdHRpbmc6IHRydWVcbiAgICB9KTtcblxuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiUFVUXCIsXG4gICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9kb2M/Zm9ybWF0PWpzb24mbmFtZT1cIiArIHRoaXMuc3RhdGUubW9kZWxOYW1lICsgXCImaWQ9XCIgKyB0aGlzLnN0YXRlLmlkLFxuICAgICAgZGF0YToge1xuICAgICAgICBkb2M6IHRoaXMuc3RhdGUuanNvblxuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgTWF0ZXJpYWxpemUudG9hc3QoXCJVcGRhdGUgc3VjY2Vzc2Z1bFwiLCAyMDAwLCBcInJvdW5kZWRcIik7XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgZXJyb3I6IHhoclxuICAgICAgfSk7XG4gICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBzdWJtaXR0aW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX29uRGF0YUNoYW5nZTogZnVuY3Rpb24gX29uRGF0YUNoYW5nZShkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBqc29uID0gSlNPTi5wYXJzZShkYXRhKTtcblxuICAgICAgLy8gbXVzdCBub3QgYmUgZW1wdHkgb2JqZWN0XG4gICAgICBpZiAoIWpzb24gfHwgIV9jb3JlLk9iamVjdC5rZXlzKGpzb24pLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGpzb246IGpzb25cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGpzb246IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfYnVpbGRFZGl0aW5nRm9ybTogZnVuY3Rpb24gX2J1aWxkRWRpdGluZ0Zvcm0oKSB7XG4gICAgdmFyIGpzb24gPSB0aGlzLnN0YXRlLmpzb247XG5cbiAgICBpZiAodW5kZWZpbmVkID09PSBqc29uKSB7XG4gICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgdGV4dDogXCJMb2FkaW5nIGRhdGFcIiB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZm9ybVwiLFxuICAgICAgeyBvblN1Ym1pdDogdGhpcy5fb25TdWJtaXQgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICBvbkNoYW5nZTogdGhpcy5fb25EYXRhQ2hhbmdlLFxuICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkoanNvbiwgbnVsbCwgMiksXG4gICAgICAgIGhlaWdodDogXCI0MDBweFwiIH0pLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTdWJtaXRCdG4sIHsgbGFiZWw6IFwiVXBkYXRlXCIsIGRpc2FibGVkOiAhanNvbiB9KVxuICAgICk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICQuYWpheCh7XG4gICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9kb2NcIixcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZm9ybWF0OiBcImpzb25cIixcbiAgICAgICAgbmFtZTogdGhpcy5zdGF0ZS5tb2RlbE5hbWUsXG4gICAgICAgIGlkOiB0aGlzLnN0YXRlLmlkIH1cbiAgICB9KS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICB2YXIgZG9jID0gZGF0YS5kb2M7XG5cbiAgICAgIC8vIHJlbW92ZSBpZCBhdHRyaWJ1dGVcbiAgICAgIGRlbGV0ZSBkb2MuX2lkO1xuXG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAganNvbjogZG9jXG4gICAgICB9KTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBlcnJvcjogeGhyXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICA7XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL3Jvdy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImFkbWluLm1vZGVscy5qcyJ9