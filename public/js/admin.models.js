webpackJsonp([2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var DefaultRoute = Router.DefaultRoute;
	var RouteHandler = Router.RouteHandler;
	var Route = Router.Route;
	
	var Models = __webpack_require__(216);
	var Model = __webpack_require__(217);
	var Row = __webpack_require__(218);
	
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

/***/ 216:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	
	var Router = __webpack_require__(166),
	    Link = Router.Link;
	
	var FilterList = __webpack_require__(207),
	    RenderUtils = __webpack_require__(209);
	
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

/***/ 217:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var Link = Router.Link;
	
	var Timer = __webpack_require__(1).Timer;
	
	var _ = __webpack_require__(215),
	    Loader = __webpack_require__(208),
	    RenderUtils = __webpack_require__(209),
	    JsonEditor = __webpack_require__(211),
	    Pagination = __webpack_require__(213),
	    Button = __webpack_require__(205),
	    SubmitButton = __webpack_require__(214),
	    GuardedStateMixin = __webpack_require__(210);
	
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
	      perPage: 10,
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
	
	  _onAddClick: function _onAddClick(e) {
	    this.context.router.transitionTo("modelRow", {
	      key: this.context.router.getCurrentParams().key,
	      id: "new"
	    });
	  },
	
	  _onLimitChange: function _onLimitChange(e) {
	    try {
	      this.setState({
	        perPage: parseInt(e.currentTarget.value)
	      });
	    } catch (err) {
	      this.setState({
	        perPage: null
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
	    return null !== this.state.filter && null !== this.state.sort && null !== this.state.perPage;
	  },
	
	  _buildTableFilter: function _buildTableFilter() {
	    var isQueryValid = this._isQueryValid();
	
	    var canRefreshResults = this.state.filter && this.state.perPage && this.state.sort;
	
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
	                    "Per page:"
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
	      RenderUtils.buildError(this.state.error),
	      React.createElement(Pagination, {
	        currentPage: this.state.page,
	        resultsPerPage: this.state.perPage,
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
	      ),
	      React.createElement(Button, { icon: "plus-circle", label: "Add", className: "add-button", onClick: this._onAddClick })
	    );
	  },
	
	  render: function render() {
	    var result = null;
	
	    if (!this.state.columns) {
	      result = React.createElement(
	        "div",
	        null,
	        React.createElement(Loader, { text: "Loading structure" }),
	        RenderUtils.buildError(this.state.error)
	      );
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
	          perPage: self.state.perPage,
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

/***/ 218:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(2)["default"];
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var Link = Router.Link;
	
	var Loader = __webpack_require__(208),
	    Button = __webpack_require__(205),
	    JsonEditor = __webpack_require__(211),
	    Modal = __webpack_require__(212),
	    RenderUtils = __webpack_require__(209),
	    GuardedStateMixin = __webpack_require__(210);
	
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
	
	  componentDidMount: function componentDidMount() {
	    var self = this;
	
	    // if creating a new item then no need to fetch data to start with
	    if ("new" === this.state.id) {
	      return this.setState({
	        json: {}
	      });
	    }
	
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
	  },
	
	  _buildEditingForm: function _buildEditingForm() {
	    var json = this.state.json;
	
	    if (undefined === json) {
	      return React.createElement(Loader, { text: "Loading data" });
	    }
	
	    var deleteButton = null,
	        saveBtnLabel = "Create";
	
	    if ("new" !== this.state.id) {
	      saveBtnLabel = "Update";
	
	      deleteButton = React.createElement(Button, { label: "Delete", color: "red", onClick: this._showDeleteModal });
	    }
	
	    return React.createElement(
	      "div",
	      null,
	      React.createElement(JsonEditor, {
	        onChange: this._onDataChange,
	        value: JSON.stringify(json, null, 2),
	        height: "400px" }),
	      React.createElement(
	        "div",
	        { className: "actions" },
	        React.createElement(Button, { label: saveBtnLabel, disabled: !json, onClick: this._save }),
	        deleteButton
	      ),
	      React.createElement(
	        Modal,
	        {
	          ref: "deleteModal",
	          id: "deleteDocModal",
	          actions: ["Yes", "No"],
	          onAction: this._onDeleteModalAction },
	        React.createElement(
	          "span",
	          null,
	          "Are you sure you want to remove this document from the collection?"
	        )
	      )
	    );
	  },
	
	  _onDataChange: function _onDataChange(data) {
	    try {
	      var json = JSON.parse(data);
	
	      // must not be empty object
	      if (!json || !_core.Object.keys(json).length) {
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
	
	  _update: function _update() {
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
	
	  _create: function _create() {
	    var self = this;
	
	    this.setState({
	      submitting: true
	    });
	
	    $.ajax({
	      method: "POST",
	      url: "/admin/models/model/doc?format=json&name=" + this.state.modelName,
	      data: {
	        doc: this.state.json
	      }
	    }).then(function (result) {
	      Materialize.toast("Create successful", 2000, "rounded");
	
	      self.setStateIfMounted({
	        id: result._id
	      });
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
	
	  _save: function _save() {
	    if ("new" === this.state.id) {
	      this._create();
	    } else {
	      this._update();
	    }
	  },
	
	  _delete: function _delete() {
	    var self = this;
	
	    this.setState({
	      submitting: true
	    });
	
	    $.ajax({
	      method: "DELETE",
	      url: "/admin/models/model/doc?format=json&name=" + this.state.modelName + "&id=" + this.state.id }).then(function () {
	      Materialize.toast("Delete successful", 2000, "rounded");
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
	
	  _showDeleteModal: function _showDeleteModal() {
	    this.refs.deleteModal.open();
	  },
	
	  _onDeleteModalAction: function _onDeleteModalAction(action) {
	    if ("Yes" === action.toLowerCase()) {
	      this._delete();
	    }
	  } });

/***/ }

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvYXBwLmpzIiwid2VicGFjazovLy8uL3BhZ2VzL21vZGVscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcGFnZXMvbW9kZWxzL3Jvdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGFBQVksQ0FBQzs7QUFFYixLQUFJLEtBQUssR0FBRyxtQkFBTyxDQUFDLEVBQU8sQ0FBQyxDQUFDO0FBQzdCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsR0FBYyxDQUFDLENBQUM7QUFDckMsS0FBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2QyxLQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLEtBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRXpCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsR0FBUyxDQUFDLENBQUM7QUFDaEMsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxHQUFTLENBQUMsQ0FBQztBQUMvQixLQUFJLEdBQUcsR0FBRyxtQkFBTyxDQUFDLEdBQU8sQ0FBQyxDQUFDOztBQUUzQixLQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQzVCLEdBQUUsV0FBVyxFQUFFLEtBQUs7O0dBRWxCLE1BQU0sRUFBRSxTQUFTLE1BQU0sR0FBRztLQUN4QixPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0RDtBQUNILEVBQUMsQ0FBQyxDQUFDOztBQUVILEtBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhO0dBQzlCLEtBQUs7R0FDTCxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUU7R0FDaEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFF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SSxDQUFDO09BQ0wsTUFBTSxFQUFFLFFBQVE7T0FDaEIsR0FBRyxFQUFFLDJDQUEyQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVk7T0FDckgsV0FBVyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7TUFDekQsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRTtPQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUM7U0FDckIsS0FBSyxFQUFFLEdBQUc7UUFDWCxDQUFDLENBQUM7TUFDSixDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVk7T0FDcEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ3JCLFVBQVUsRUFBRSxLQUFLO1FBQ2xCLENBQUMsQ0FBQztNQUNKLENBQUMsQ0FBQztBQUNQLElBQUc7O0dBRUQsZ0JBQWdCLEVBQUUsU0FBUyxnQkFBZ0IsR0FBRztLQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNqQyxJQUFHOztHQUVELG9CQUFvQixFQUFFLFNBQVMsb0JBQW9CLENBQUMsTUFBTSxFQUFFO0tBQzFELElBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRTtPQUNsQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7TUFDaEI7SUFDRixFQUFFLENBQUMsQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKTtcbnZhciBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xudmFyIFJvdXRlSGFuZGxlciA9IFJvdXRlci5Sb3V0ZUhhbmRsZXI7XG52YXIgUm91dGUgPSBSb3V0ZXIuUm91dGU7XG5cbnZhciBNb2RlbHMgPSByZXF1aXJlKFwiLi9pbmRleFwiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuL21vZGVsXCIpO1xudmFyIFJvdyA9IHJlcXVpcmUoXCIuL3Jvd1wiKTtcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiQXBwXCIsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUm91dGVIYW5kbGVyLCB0aGlzLnByb3BzKTtcbiAgfVxufSk7XG5cbnZhciByb3V0ZXMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICBSb3V0ZSxcbiAgeyBoYW5kbGVyOiBBcHAgfSxcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChEZWZhdWx0Um91dGUsIHsgbmFtZTogXCJtb2RlbHNcIiwgaGFuZGxlcjogTW9kZWxzIH0pLFxuICBSZWFjdC5jcmVhdGVFbGVtZW50KFJvdXRlLCB7IG5hbWU6IFwibW9kZWxcIiwgcGF0aDogXCIvOmtleVwiLCBoYW5kbGVyOiBNb2RlbCB9KSxcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChSb3V0ZSwgeyBuYW1lOiBcIm1vZGVsUm93XCIsIHBhdGg6IFwiLzprZXkvOmlkXCIsIGhhbmRsZXI6IFJvdyB9KVxuKTtcblxuUm91dGVyLnJ1bihyb3V0ZXMsIFJvdXRlci5IYXNoTG9jYXRpb24sIGZ1bmN0aW9uIChIYW5kbGVyLCBzdGF0ZSkge1xuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChIYW5kbGVyLCB7IHJvdXRlczogc3RhdGUucm91dGVzLCBwYXJhbXM6IHN0YXRlLnBhcmFtcywgcXVlcnk6IHN0YXRlLnF1ZXJ5IH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlYWN0LXJvb3RcIikpO1xufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL2FwcC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpLFxuICAgIExpbmsgPSBSb3V0ZXIuTGluaztcblxudmFyIEZpbHRlckxpc3QgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9maWx0ZXJMaXN0XCIpLFxuICAgIFJlbmRlclV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL3JlbmRlclV0aWxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJkaXZcIixcbiAgICAgIHsgY2xhc3NOYW1lOiBcInBhZ2UtbW9kZWxzXCIgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRmlsdGVyTGlzdCwge1xuICAgICAgICBhamF4VXJsOiBcIi9hZG1pbi9tb2RlbHM/Zm9ybWF0PWpzb25cIixcbiAgICAgICAgYWpheFJlc3BvbnNlRGF0YU1hcHBlcjogdGhpcy5fbWFwQWpheERhdGEsXG4gICAgICAgIGl0ZW1EaXNwbGF5TmFtZUZvcm1hdHRlcjogdGhpcy5fZ2V0SXRlbURpc3BsYXlOYW1lLFxuICAgICAgICBpdGVtUm91dGU6IFwibW9kZWxcIiB9KVxuICAgICk7XG4gIH0sXG5cbiAgX21hcEFqYXhEYXRhOiBmdW5jdGlvbiBfbWFwQWpheERhdGEoZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhIHx8IHt9O1xuXG4gICAgcmV0dXJuIChkYXRhLm1vZGVscyB8fCBbXSkubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IHIsXG4gICAgICAgIG5hbWU6IHIgfTtcbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0SXRlbURpc3BsYXlOYW1lOiBmdW5jdGlvbiBfZ2V0SXRlbURpc3BsYXlOYW1lKGl0ZW0pIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwic3BhblwiLFxuICAgICAgbnVsbCxcbiAgICAgIGl0ZW0ubmFtZVxuICAgICk7XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL2luZGV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xudmFyIExpbmsgPSBSb3V0ZXIuTGluaztcblxudmFyIFRpbWVyID0gcmVxdWlyZShcImNsb2NrbWFrZXJcIikuVGltZXI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL2xvZGFzaFwiKSxcbiAgICBMb2FkZXIgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9sb2FkZXJcIiksXG4gICAgUmVuZGVyVXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvcmVuZGVyVXRpbHNcIiksXG4gICAgSnNvbkVkaXRvciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2pzb25FZGl0b3JcIiksXG4gICAgUGFnaW5hdGlvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL3BhZ2luYXRpb25cIiksXG4gICAgQnV0dG9uID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvYnV0dG9uXCIpLFxuICAgIFN1Ym1pdEJ1dHRvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL3N1Ym1pdEJ1dHRvblwiKSxcbiAgICBHdWFyZGVkU3RhdGVNaXhpbiA9IHJlcXVpcmUoXCIuLi8uLi9taXhpbnMvZ3VhcmRlZFN0YXRlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIGNvbnRleHRUeXBlczoge1xuICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICBtaXhpbnM6IFtHdWFyZGVkU3RhdGVNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsTmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmtleSksXG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBwZXJQYWdlOiAxMCxcbiAgICAgIGZpbHRlcjoge30sXG4gICAgICBzb3J0OiB7fSxcbiAgICAgIHBhZ2U6IDEgfTtcbiAgfSxcblxuICBfb25Sb3dDbGljazogZnVuY3Rpb24gX29uUm93Q2xpY2soZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRoaXMuY29udGV4dC5yb3V0ZXIudHJhbnNpdGlvblRvKFwibW9kZWxSb3dcIiwge1xuICAgICAga2V5OiB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5rZXksXG4gICAgICBpZDogZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgfSk7XG4gIH0sXG5cbiAgX29uQWRkQ2xpY2s6IGZ1bmN0aW9uIF9vbkFkZENsaWNrKGUpIHtcbiAgICB0aGlzLmNvbnRleHQucm91dGVyLnRyYW5zaXRpb25UbyhcIm1vZGVsUm93XCIsIHtcbiAgICAgIGtleTogdGhpcy5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkua2V5LFxuICAgICAgaWQ6IFwibmV3XCJcbiAgICB9KTtcbiAgfSxcblxuICBfb25MaW1pdENoYW5nZTogZnVuY3Rpb24gX29uTGltaXRDaGFuZ2UoZSkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcGVyUGFnZTogcGFyc2VJbnQoZS5jdXJyZW50VGFyZ2V0LnZhbHVlKVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcGVyUGFnZTogbnVsbFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkZpbHRlckNoYW5nZTogZnVuY3Rpb24gX29uRmlsdGVyQ2hhbmdlKHZhbCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmlsdGVyOiBKU09OLnBhcnNlKHZhbCkgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmlsdGVyOiBudWxsIH0pO1xuICAgIH1cbiAgfSxcblxuICBfb25Tb3J0Q2hhbmdlOiBmdW5jdGlvbiBfb25Tb3J0Q2hhbmdlKHZhbCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc29ydDogSlNPTi5wYXJzZSh2YWwpIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNvcnQ6IG51bGwgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9pc1F1ZXJ5VmFsaWQ6IGZ1bmN0aW9uIF9pc1F1ZXJ5VmFsaWQoKSB7XG4gICAgcmV0dXJuIG51bGwgIT09IHRoaXMuc3RhdGUuZmlsdGVyICYmIG51bGwgIT09IHRoaXMuc3RhdGUuc29ydCAmJiBudWxsICE9PSB0aGlzLnN0YXRlLnBlclBhZ2U7XG4gIH0sXG5cbiAgX2J1aWxkVGFibGVGaWx0ZXI6IGZ1bmN0aW9uIF9idWlsZFRhYmxlRmlsdGVyKCkge1xuICAgIHZhciBpc1F1ZXJ5VmFsaWQgPSB0aGlzLl9pc1F1ZXJ5VmFsaWQoKTtcblxuICAgIHZhciBjYW5SZWZyZXNoUmVzdWx0cyA9IHRoaXMuc3RhdGUuZmlsdGVyICYmIHRoaXMuc3RhdGUucGVyUGFnZSAmJiB0aGlzLnN0YXRlLnNvcnQ7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJyb3dcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sIHMxMiBtN1wiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJ1bFwiLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIm1vZGVsLWZpbHRlcnMgY29sbGFwc2libGVcIiwgcmVmOiBcInF1ZXJ5U2V0dGluZ3NcIiB9LFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sbGFwc2libGUtaGVhZGVyIGFjdGl2ZVwiIH0sXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHsgY2xhc3NOYW1lOiBcImZhIGZhLWdlYXJcIiB9KSxcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFwiUXVlcnkgc2V0dGluZ3NcIlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sbGFwc2libGUtYm9keVwiIH0sXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJmb3JtXCIsXG4gICAgICAgICAgICAgICAgeyBvblN1Ym1pdDogdGhpcy5fc3VibWl0U2V0dGluZ3NGb3JtIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIkZpbHRlcjpcIlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJ7fVwiLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5fb25GaWx0ZXJDaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogXCIxMDBweFwiLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCIyMDBweFwiIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImZpbHRlclwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydDpcIlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJ7fVwiLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5fb25Tb3J0Q2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwcHhcIixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMjAwcHhcIiB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIlBlciBwYWdlOlwiXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBcIjEwXCIsIG9uQ2hhbmdlOiB0aGlzLl9vbkxpbWl0Q2hhbmdlIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImFjdGlvblwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFN1Ym1pdEJ1dHRvbiwgeyBsYWJlbDogXCJBcHBseVwiLCBkaXNhYmxlZDogIWNhblJlZnJlc2hSZXN1bHRzIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBfYnVpbGRUYWJsZTogZnVuY3Rpb24gX2J1aWxkVGFibGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLnN0YXRlLmNvbHVtbnMsXG4gICAgICAgIHJvd3MgPSB0aGlzLnN0YXRlLnJvd3MgfHwgW107XG5cbiAgICB2YXIgaGVhZGVyID0gY29sdW1ucy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcInRoXCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGMubmFtZVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHZhciBib2R5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICBib2R5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJ0clwiLFxuICAgICAgICBudWxsLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGRcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCBudWxsKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBib2R5ID0gcm93cy5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgdmFsdWVzID0gY29sdW1ucy5tYXAoZnVuY3Rpb24gKGNvbCkge1xuXG4gICAgICAgICAgdmFyIHZhbHVlID0gcm93W2NvbC5uYW1lXSxcbiAgICAgICAgICAgICAgZmxpcFZhbHVlID0gbnVsbDtcblxuICAgICAgICAgIC8vIGlmIHZhbHVlIGlzIGEgZGF0ZVxuICAgICAgICAgIGlmIChcIkRhdGVcIiA9PT0gY29sLnR5cGUpIHtcbiAgICAgICAgICAgIGZsaXBWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSkudG9TdHJpbmcoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBpZiB2YWx1ZSBpcyBhbiBhcnJheVxuICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAvLyBleHRyYWN0IHN1YiBrZXlcbiAgICAgICAgICAgIGlmIChjb2wuc3ViS2V5KSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gXy5wbHVjayh2YWx1ZSwgY29sLnN1YktleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnN0cnVjdCBsaXN0XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHYgfSxcbiAgICAgICAgICAgICAgICB2XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICBcInVsXCIsXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdHJpbmdpZnkgb2JqZWN0c1xuICAgICAgICAgIGVsc2UgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICB7IGtleTogY29sLm5hbWUsIGRhdGFGbGlwVmFsdWU6IGZsaXBWYWx1ZSB9LFxuICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgeyBpZDogcm93Ll9pZCwga2V5OiByb3cuX2lkLCBvbkNsaWNrOiBzZWxmLl9vblJvd0NsaWNrIH0sXG4gICAgICAgICAgdmFsdWVzXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdGFibGVGaWx0ZXIgPSB0aGlzLl9idWlsZFRhYmxlRmlsdGVyKCk7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICBudWxsLFxuICAgICAgdGFibGVGaWx0ZXIsXG4gICAgICBSZW5kZXJVdGlscy5idWlsZEVycm9yKHRoaXMuc3RhdGUuZXJyb3IpLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChQYWdpbmF0aW9uLCB7XG4gICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLnN0YXRlLnBhZ2UsXG4gICAgICAgIHJlc3VsdHNQZXJQYWdlOiB0aGlzLnN0YXRlLnBlclBhZ2UsXG4gICAgICAgIHRvdGFsUmVzdWx0czogdGhpcy5zdGF0ZS50b3RhbFJvd3MsXG4gICAgICAgIG9uU2VsZWN0UGFnZTogdGhpcy5fb25TZWxlY3RQYWdlIH0pLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJob3ZlcmFibGUgYm9yZGVyZWRcIiB9LFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGhlYWRcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgaGVhZGVyXG4gICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGJvZHlcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQnV0dG9uLCB7IGljb246IFwicGx1cy1jaXJjbGVcIiwgbGFiZWw6IFwiQWRkXCIsIGNsYXNzTmFtZTogXCJhZGQtYnV0dG9uXCIsIG9uQ2xpY2s6IHRoaXMuX29uQWRkQ2xpY2sgfSlcbiAgICApO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuXG4gICAgaWYgKCF0aGlzLnN0YXRlLmNvbHVtbnMpIHtcbiAgICAgIHJlc3VsdCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCB7IHRleHQ6IFwiTG9hZGluZyBzdHJ1Y3R1cmVcIiB9KSxcbiAgICAgICAgUmVuZGVyVXRpbHMuYnVpbGRFcnJvcih0aGlzLnN0YXRlLmVycm9yKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fYnVpbGRUYWJsZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJkaXZcIixcbiAgICAgIHsgY2xhc3NOYW1lOiBcInBhZ2UtbW9kZWxcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJoMlwiLFxuICAgICAgICBudWxsLFxuICAgICAgICBcIkNvbGxlY3Rpb246IFwiLFxuICAgICAgICB0aGlzLnN0YXRlLm1vZGVsTmFtZVxuICAgICAgKSxcbiAgICAgIHJlc3VsdFxuICAgICk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnF1ZXJ5U2V0dGluZ3NJbml0aWFsaXNlZCkge1xuICAgICAgJChSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucXVlcnlTZXR0aW5ncykpLmNvbGxhcHNpYmxlKCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBxdWVyeVNldHRpbmdzSW5pdGlhbGlzZWQ6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gZmV0Y2ggY29sdW1uIGluZm9cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvY29sdW1uc1wiLFxuICAgICAgZGF0YToge1xuICAgICAgICBmb3JtYXQ6IFwianNvblwiLFxuICAgICAgICBuYW1lOiB0aGlzLnN0YXRlLm1vZGVsTmFtZSB9XG4gICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1uc1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX2ZldGNoUm93cygpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIDtcbiAgfSxcblxuICBfc3VibWl0U2V0dGluZ3NGb3JtOiBmdW5jdGlvbiBfc3VibWl0U2V0dGluZ3NGb3JtKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyByZXNldCBwYWdlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwYWdlOiAxXG4gICAgfSk7XG5cbiAgICB0aGlzLl9mZXRjaFJvd3MoKTtcbiAgfSxcblxuICBfb25TZWxlY3RQYWdlOiBmdW5jdGlvbiBfb25TZWxlY3RQYWdlKG5ld1BhZ2UpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHBhZ2U6IG5ld1BhZ2VcbiAgICB9KTtcblxuICAgIHRoaXMuX2ZldGNoUm93cygpO1xuICB9LFxuXG4gIF9mZXRjaFJvd3M6IGZ1bmN0aW9uIF9mZXRjaFJvd3MoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gZ2l2ZSB0aW1lIGZvciB2YWx1ZXMgdG8gcHJvcGFnYXRlXG4gICAgaWYgKHNlbGYuX2ZldGNoUm93c1RpbWVyKSB7XG4gICAgICBzZWxmLl9mZXRjaFJvd3NUaW1lci5zdG9wKCk7XG4gICAgfVxuXG4gICAgc2VsZi5fZmV0Y2hSb3dzVGltZXIgPSBUaW1lcihmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICBlcnJvcjogbnVsbCB9KTtcblxuICAgICAgdmFyIGNvbHVtbk5hbWVzID0gXy5wbHVjayhzZWxmLnN0YXRlLmNvbHVtbnMsIFwibmFtZVwiKTtcblxuICAgICAgLy8gZmV0Y2ggY29sbGVjdGlvbiByb3dzXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9yb3dzP2Zvcm1hdD1qc29uXCIsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBuYW1lOiBzZWxmLnN0YXRlLm1vZGVsTmFtZSxcbiAgICAgICAgICBmaWx0ZXI6IEpTT04uc3RyaW5naWZ5KHNlbGYuc3RhdGUuZmlsdGVyKSxcbiAgICAgICAgICBzb3J0OiBKU09OLnN0cmluZ2lmeShzZWxmLnN0YXRlLnNvcnQpLFxuICAgICAgICAgIHBlclBhZ2U6IHNlbGYuc3RhdGUucGVyUGFnZSxcbiAgICAgICAgICBwYWdlOiBzZWxmLnN0YXRlLnBhZ2UgfVxuICAgICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgICB0b3RhbFJvd3M6IGRhdGEuY291bnQsXG4gICAgICAgICAgcm93czogZGF0YS5yb3dzIH0pO1xuICAgICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICAgIGVycm9yOiB4aHJcbiAgICAgICAgfSk7XG4gICAgICB9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDIwMCkuc3RhcnQoKTtcbiAgfSB9KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9tb2RlbHMvbW9kZWwuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jb3JlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qc1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xudmFyIExpbmsgPSBSb3V0ZXIuTGluaztcblxudmFyIExvYWRlciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2xvYWRlclwiKSxcbiAgICBCdXR0b24gPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9idXR0b25cIiksXG4gICAgSnNvbkVkaXRvciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2pzb25FZGl0b3JcIiksXG4gICAgTW9kYWwgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9tb2RhbFwiKSxcbiAgICBSZW5kZXJVdGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9yZW5kZXJVdGlsc1wiKSxcbiAgICBHdWFyZGVkU3RhdGVNaXhpbiA9IHJlcXVpcmUoXCIuLi8uLi9taXhpbnMvZ3VhcmRlZFN0YXRlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIGNvbnRleHRUeXBlczoge1xuICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICBtaXhpbnM6IFtHdWFyZGVkU3RhdGVNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgdmFyIHBhcmFtcyA9IHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsTmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5rZXkpLFxuICAgICAgaWQ6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbXMuaWQpLFxuICAgICAgZXJyb3I6IG51bGwgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgZWRpdGluZ0Zvcm0gPSB0aGlzLl9idWlsZEVkaXRpbmdGb3JtKCk7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJwYWdlLW1vZGVsUm93XCIgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiaDJcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwidGl0bGVcIiB9LFxuICAgICAgICB0aGlzLnN0YXRlLm1vZGVsTmFtZSxcbiAgICAgICAgXCIvXCIsXG4gICAgICAgIHRoaXMuc3RhdGUuaWRcbiAgICAgICksXG4gICAgICBSZW5kZXJVdGlscy5idWlsZEVycm9yKHRoaXMuc3RhdGUuZXJyb3IpLFxuICAgICAgZWRpdGluZ0Zvcm1cbiAgICApO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBpZiBjcmVhdGluZyBhIG5ldyBpdGVtIHRoZW4gbm8gbmVlZCB0byBmZXRjaCBkYXRhIHRvIHN0YXJ0IHdpdGhcbiAgICBpZiAoXCJuZXdcIiA9PT0gdGhpcy5zdGF0ZS5pZCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBqc29uOiB7fVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogXCIvYWRtaW4vbW9kZWxzL21vZGVsL2RvY1wiLFxuICAgICAgZGF0YToge1xuICAgICAgICBmb3JtYXQ6IFwianNvblwiLFxuICAgICAgICBuYW1lOiB0aGlzLnN0YXRlLm1vZGVsTmFtZSxcbiAgICAgICAgaWQ6IHRoaXMuc3RhdGUuaWQgfVxuICAgIH0pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHZhciBkb2MgPSBkYXRhLmRvYztcblxuICAgICAgLy8gcmVtb3ZlIGlkIGF0dHJpYnV0ZVxuICAgICAgZGVsZXRlIGRvYy5faWQ7XG5cbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBqc29uOiBkb2NcbiAgICAgIH0pO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIDtcbiAgfSxcblxuICBfYnVpbGRFZGl0aW5nRm9ybTogZnVuY3Rpb24gX2J1aWxkRWRpdGluZ0Zvcm0oKSB7XG4gICAgdmFyIGpzb24gPSB0aGlzLnN0YXRlLmpzb247XG5cbiAgICBpZiAodW5kZWZpbmVkID09PSBqc29uKSB7XG4gICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgdGV4dDogXCJMb2FkaW5nIGRhdGFcIiB9KTtcbiAgICB9XG5cbiAgICB2YXIgZGVsZXRlQnV0dG9uID0gbnVsbCxcbiAgICAgICAgc2F2ZUJ0bkxhYmVsID0gXCJDcmVhdGVcIjtcblxuICAgIGlmIChcIm5ld1wiICE9PSB0aGlzLnN0YXRlLmlkKSB7XG4gICAgICBzYXZlQnRuTGFiZWwgPSBcIlVwZGF0ZVwiO1xuXG4gICAgICBkZWxldGVCdXR0b24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KEJ1dHRvbiwgeyBsYWJlbDogXCJEZWxldGVcIiwgY29sb3I6IFwicmVkXCIsIG9uQ2xpY2s6IHRoaXMuX3Nob3dEZWxldGVNb2RhbCB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICBudWxsLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLl9vbkRhdGFDaGFuZ2UsXG4gICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAyKSxcbiAgICAgICAgaGVpZ2h0OiBcIjQwMHB4XCIgfSksXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJhY3Rpb25zXCIgfSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChCdXR0b24sIHsgbGFiZWw6IHNhdmVCdG5MYWJlbCwgZGlzYWJsZWQ6ICFqc29uLCBvbkNsaWNrOiB0aGlzLl9zYXZlIH0pLFxuICAgICAgICBkZWxldGVCdXR0b25cbiAgICAgICksXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBNb2RhbCxcbiAgICAgICAge1xuICAgICAgICAgIHJlZjogXCJkZWxldGVNb2RhbFwiLFxuICAgICAgICAgIGlkOiBcImRlbGV0ZURvY01vZGFsXCIsXG4gICAgICAgICAgYWN0aW9uczogW1wiWWVzXCIsIFwiTm9cIl0sXG4gICAgICAgICAgb25BY3Rpb246IHRoaXMuX29uRGVsZXRlTW9kYWxBY3Rpb24gfSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSB0aGlzIGRvY3VtZW50IGZyb20gdGhlIGNvbGxlY3Rpb24/XCJcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgX29uRGF0YUNoYW5nZTogZnVuY3Rpb24gX29uRGF0YUNoYW5nZShkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBqc29uID0gSlNPTi5wYXJzZShkYXRhKTtcblxuICAgICAgLy8gbXVzdCBub3QgYmUgZW1wdHkgb2JqZWN0XG4gICAgICBpZiAoIWpzb24gfHwgIV9jb3JlLk9iamVjdC5rZXlzKGpzb24pLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGpzb246IGRhdGFcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGpzb246IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfdXBkYXRlOiBmdW5jdGlvbiBfdXBkYXRlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc3VibWl0dGluZzogdHJ1ZVxuICAgIH0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJQVVRcIixcbiAgICAgIHVybDogXCIvYWRtaW4vbW9kZWxzL21vZGVsL2RvYz9mb3JtYXQ9anNvbiZuYW1lPVwiICsgdGhpcy5zdGF0ZS5tb2RlbE5hbWUgKyBcIiZpZD1cIiArIHRoaXMuc3RhdGUuaWQsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRvYzogdGhpcy5zdGF0ZS5qc29uXG4gICAgICB9XG4gICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICBNYXRlcmlhbGl6ZS50b2FzdChcIlVwZGF0ZSBzdWNjZXNzZnVsXCIsIDIwMDAsIFwicm91bmRlZFwiKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBlcnJvcjogeGhyXG4gICAgICB9KTtcbiAgICB9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIHN1Ym1pdHRpbmc6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICBfY3JlYXRlOiBmdW5jdGlvbiBfY3JlYXRlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc3VibWl0dGluZzogdHJ1ZVxuICAgIH0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9kb2M/Zm9ybWF0PWpzb24mbmFtZT1cIiArIHRoaXMuc3RhdGUubW9kZWxOYW1lLFxuICAgICAgZGF0YToge1xuICAgICAgICBkb2M6IHRoaXMuc3RhdGUuanNvblxuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgTWF0ZXJpYWxpemUudG9hc3QoXCJDcmVhdGUgc3VjY2Vzc2Z1bFwiLCAyMDAwLCBcInJvdW5kZWRcIik7XG5cbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBpZDogcmVzdWx0Ll9pZFxuICAgICAgfSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgZXJyb3I6IHhoclxuICAgICAgfSk7XG4gICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBzdWJtaXR0aW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3NhdmU6IGZ1bmN0aW9uIF9zYXZlKCkge1xuICAgIGlmIChcIm5ld1wiID09PSB0aGlzLnN0YXRlLmlkKSB7XG4gICAgICB0aGlzLl9jcmVhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgfVxuICB9LFxuXG4gIF9kZWxldGU6IGZ1bmN0aW9uIF9kZWxldGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzdWJtaXR0aW5nOiB0cnVlXG4gICAgfSk7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvZG9jP2Zvcm1hdD1qc29uJm5hbWU9XCIgKyB0aGlzLnN0YXRlLm1vZGVsTmFtZSArIFwiJmlkPVwiICsgdGhpcy5zdGF0ZS5pZCB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIE1hdGVyaWFsaXplLnRvYXN0KFwiRGVsZXRlIHN1Y2Nlc3NmdWxcIiwgMjAwMCwgXCJyb3VuZGVkXCIpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgc3VibWl0dGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIF9zaG93RGVsZXRlTW9kYWw6IGZ1bmN0aW9uIF9zaG93RGVsZXRlTW9kYWwoKSB7XG4gICAgdGhpcy5yZWZzLmRlbGV0ZU1vZGFsLm9wZW4oKTtcbiAgfSxcblxuICBfb25EZWxldGVNb2RhbEFjdGlvbjogZnVuY3Rpb24gX29uRGVsZXRlTW9kYWxBY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKFwiWWVzXCIgPT09IGFjdGlvbi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICB0aGlzLl9kZWxldGUoKTtcbiAgICB9XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL3Jvdy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImFkbWluLm1vZGVscy5qcyJ9