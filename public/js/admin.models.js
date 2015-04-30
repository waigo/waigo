webpackJsonp([2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var DefaultRoute = Router.DefaultRoute;
	var RouteHandler = Router.RouteHandler;
	var Route = Router.Route;
	
	var Models = __webpack_require__(219);
	var Model = __webpack_require__(220);
	var Row = __webpack_require__(221);
	
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

/***/ 219:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	
	var Router = __webpack_require__(166),
	    Link = Router.Link;
	
	var FilterList = __webpack_require__(210),
	    RenderUtils = __webpack_require__(212);
	
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

/***/ 220:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var Link = Router.Link;
	
	var Timer = __webpack_require__(1).Timer;
	
	var _ = __webpack_require__(218),
	    Loader = __webpack_require__(211),
	    RenderUtils = __webpack_require__(212),
	    JsonEditor = __webpack_require__(214),
	    Pagination = __webpack_require__(216),
	    Button = __webpack_require__(208),
	    SubmitButton = __webpack_require__(217),
	    GuardedStateMixin = __webpack_require__(213);
	
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
	              { className: "collapsible-header" },
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
	                    value: {},
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
	                    value: {},
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
	      )
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
	      React.createElement(Button, { icon: "plus-circle", label: "Add", className: "add-button", onClick: this._onAddClick }),
	      React.createElement(
	        "h2",
	        null,
	        React.createElement(
	          Link,
	          { to: "models" },
	          "Collection"
	        ),
	        React.createElement(
	          "span",
	          null,
	          " / ",
	          this.state.modelName
	        )
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

/***/ 221:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(2)["default"];
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var Link = Router.Link;
	
	var Loader = __webpack_require__(211),
	    Button = __webpack_require__(208),
	    JsonEditor = __webpack_require__(214),
	    Modal = __webpack_require__(215),
	    RenderUtils = __webpack_require__(212),
	    GuardedStateMixin = __webpack_require__(213);
	
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
	        React.createElement(
	          Link,
	          { to: "model", params: { key: this.state.modelName } },
	          this.state.modelName
	        ),
	        React.createElement(
	          "span",
	          null,
	          " / ",
	          this.state.id
	        )
	      ),
	      RenderUtils.buildError(this.state.error),
	      editingForm
	    );
	  },
	
	  componentDidMount: function componentDidMount() {
	    this._load();
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
	        value: json,
	        height: "400px",
	        ref: "editor" }),
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
	
	  _load: function _load() {
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
	      var doc = JSON.parse(data.doc);
	
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
	
	  _update: function _update() {
	    var self = this;
	
	    this.setState({
	      submitting: true,
	      error: null
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
	      submitting: true,
	      error: null
	    });
	
	    $.ajax({
	      method: "POST",
	      url: "/admin/models/model/doc?format=json&name=" + this.state.modelName,
	      data: {
	        doc: this.state.json
	      }
	    }).then(function (data) {
	      Materialize.toast("Create successful", 2000, "rounded");
	
	      var doc = JSON.parse(data.doc),
	          id = doc._id;
	
	      delete doc._id;
	
	      self.setStateIfMounted({
	        id: id,
	        json: doc });
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
	      submitting: true,
	      error: null });
	
	    $.ajax({
	      method: "DELETE",
	      url: "/admin/models/model/doc?format=json&name=" + this.state.modelName + "&id=" + this.state.id }).then(function () {
	      Materialize.toast("Delete successful", 2000, "rounded");
	
	      self.context.router.transitionTo("model", {
	        key: self.context.router.getCurrentParams().key });
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
	    if ("yes" === action.toLowerCase()) {
	      this._delete();
	    }
	  } });

/***/ }

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvYXBwLmpzIiwid2VicGFjazovLy8uL3BhZ2VzL21vZGVscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcGFnZXMvbW9kZWxzL3Jvdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGFBQVksQ0FBQzs7QUFFYixLQUFJLEtBQUssR0FBRyxtQkFBTyxDQUFDLEVBQU8sQ0FBQyxDQUFDO0FBQzdCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsR0FBYyxDQUFDLENBQUM7QUFDckMsS0FBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2QyxLQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLEtBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRXpCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsR0FBUyxDQUFDLENBQUM7QUFDaEMsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxHQUFTLENBQUMsQ0FBQztBQUMvQixLQUFJLEdBQUcsR0FBRyxtQkFBTyxDQUFDLEdBQU8sQ0FBQyxDQUFDOztBQUUzQixLQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQzVCLEdBQUUsV0FBVyxFQUFFLEtBQUs7O0dBRWxCLE1BQU0sRUFBRSxTQUFTLE1BQU0sR0FBRztLQUN4QixPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0RDtBQUNILEVBQUMsQ0FBQyxDQUFDOztBQUVILEtBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhO0dBQzlCLEtBQUs7R0FDTCxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUU7R0FDaEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFF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QyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7TUFDdEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRTtPQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUM7U0FDckIsS0FBSyxFQUFFLEdBQUc7UUFDWCxDQUFDLENBQUM7TUFDSixDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVk7T0FDcEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ3JCLFVBQVUsRUFBRSxLQUFLO1FBQ2xCLENBQUMsQ0FBQztNQUNKLENBQUMsQ0FBQztBQUNQLElBQUc7O0dBRUQsZ0JBQWdCLEVBQUUsU0FBUyxnQkFBZ0IsR0FBRztLQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNqQyxJQUFHOztHQUVELG9CQUFvQixFQUFFLFNBQVMsb0JBQW9CLENBQUMsTUFBTSxFQUFFO0tBQzFELElBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRTtPQUNsQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7TUFDaEI7SUFDRixFQUFFLENBQUMsQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKTtcbnZhciBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xudmFyIFJvdXRlSGFuZGxlciA9IFJvdXRlci5Sb3V0ZUhhbmRsZXI7XG52YXIgUm91dGUgPSBSb3V0ZXIuUm91dGU7XG5cbnZhciBNb2RlbHMgPSByZXF1aXJlKFwiLi9pbmRleFwiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuL21vZGVsXCIpO1xudmFyIFJvdyA9IHJlcXVpcmUoXCIuL3Jvd1wiKTtcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiQXBwXCIsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUm91dGVIYW5kbGVyLCB0aGlzLnByb3BzKTtcbiAgfVxufSk7XG5cbnZhciByb3V0ZXMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICBSb3V0ZSxcbiAgeyBoYW5kbGVyOiBBcHAgfSxcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChEZWZhdWx0Um91dGUsIHsgbmFtZTogXCJtb2RlbHNcIiwgaGFuZGxlcjogTW9kZWxzIH0pLFxuICBSZWFjdC5jcmVhdGVFbGVtZW50KFJvdXRlLCB7IG5hbWU6IFwibW9kZWxcIiwgcGF0aDogXCIvOmtleVwiLCBoYW5kbGVyOiBNb2RlbCB9KSxcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChSb3V0ZSwgeyBuYW1lOiBcIm1vZGVsUm93XCIsIHBhdGg6IFwiLzprZXkvOmlkXCIsIGhhbmRsZXI6IFJvdyB9KVxuKTtcblxuUm91dGVyLnJ1bihyb3V0ZXMsIFJvdXRlci5IYXNoTG9jYXRpb24sIGZ1bmN0aW9uIChIYW5kbGVyLCBzdGF0ZSkge1xuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChIYW5kbGVyLCB7IHJvdXRlczogc3RhdGUucm91dGVzLCBwYXJhbXM6IHN0YXRlLnBhcmFtcywgcXVlcnk6IHN0YXRlLnF1ZXJ5IH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlYWN0LXJvb3RcIikpO1xufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL2FwcC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpLFxuICAgIExpbmsgPSBSb3V0ZXIuTGluaztcblxudmFyIEZpbHRlckxpc3QgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9maWx0ZXJMaXN0XCIpLFxuICAgIFJlbmRlclV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL3JlbmRlclV0aWxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJkaXZcIixcbiAgICAgIHsgY2xhc3NOYW1lOiBcInBhZ2UtbW9kZWxzXCIgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRmlsdGVyTGlzdCwge1xuICAgICAgICBhamF4VXJsOiBcIi9hZG1pbi9tb2RlbHM/Zm9ybWF0PWpzb25cIixcbiAgICAgICAgYWpheFJlc3BvbnNlRGF0YU1hcHBlcjogdGhpcy5fbWFwQWpheERhdGEsXG4gICAgICAgIGl0ZW1EaXNwbGF5TmFtZUZvcm1hdHRlcjogdGhpcy5fZ2V0SXRlbURpc3BsYXlOYW1lLFxuICAgICAgICBpdGVtUm91dGU6IFwibW9kZWxcIiB9KVxuICAgICk7XG4gIH0sXG5cbiAgX21hcEFqYXhEYXRhOiBmdW5jdGlvbiBfbWFwQWpheERhdGEoZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhIHx8IHt9O1xuXG4gICAgcmV0dXJuIChkYXRhLm1vZGVscyB8fCBbXSkubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IHIsXG4gICAgICAgIG5hbWU6IHIgfTtcbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0SXRlbURpc3BsYXlOYW1lOiBmdW5jdGlvbiBfZ2V0SXRlbURpc3BsYXlOYW1lKGl0ZW0pIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwic3BhblwiLFxuICAgICAgbnVsbCxcbiAgICAgIGl0ZW0ubmFtZVxuICAgICk7XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL2luZGV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xudmFyIExpbmsgPSBSb3V0ZXIuTGluaztcblxudmFyIFRpbWVyID0gcmVxdWlyZShcImNsb2NrbWFrZXJcIikuVGltZXI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL2xvZGFzaFwiKSxcbiAgICBMb2FkZXIgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9sb2FkZXJcIiksXG4gICAgUmVuZGVyVXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvcmVuZGVyVXRpbHNcIiksXG4gICAgSnNvbkVkaXRvciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2pzb25FZGl0b3JcIiksXG4gICAgUGFnaW5hdGlvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL3BhZ2luYXRpb25cIiksXG4gICAgQnV0dG9uID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvYnV0dG9uXCIpLFxuICAgIFN1Ym1pdEJ1dHRvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL3N1Ym1pdEJ1dHRvblwiKSxcbiAgICBHdWFyZGVkU3RhdGVNaXhpbiA9IHJlcXVpcmUoXCIuLi8uLi9taXhpbnMvZ3VhcmRlZFN0YXRlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIGNvbnRleHRUeXBlczoge1xuICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICBtaXhpbnM6IFtHdWFyZGVkU3RhdGVNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsTmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmtleSksXG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBwZXJQYWdlOiAxMCxcbiAgICAgIGZpbHRlcjoge30sXG4gICAgICBzb3J0OiB7fSxcbiAgICAgIHBhZ2U6IDEgfTtcbiAgfSxcblxuICBfb25Sb3dDbGljazogZnVuY3Rpb24gX29uUm93Q2xpY2soZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRoaXMuY29udGV4dC5yb3V0ZXIudHJhbnNpdGlvblRvKFwibW9kZWxSb3dcIiwge1xuICAgICAga2V5OiB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5rZXksXG4gICAgICBpZDogZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgfSk7XG4gIH0sXG5cbiAgX29uQWRkQ2xpY2s6IGZ1bmN0aW9uIF9vbkFkZENsaWNrKGUpIHtcbiAgICB0aGlzLmNvbnRleHQucm91dGVyLnRyYW5zaXRpb25UbyhcIm1vZGVsUm93XCIsIHtcbiAgICAgIGtleTogdGhpcy5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkua2V5LFxuICAgICAgaWQ6IFwibmV3XCJcbiAgICB9KTtcbiAgfSxcblxuICBfb25MaW1pdENoYW5nZTogZnVuY3Rpb24gX29uTGltaXRDaGFuZ2UoZSkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcGVyUGFnZTogcGFyc2VJbnQoZS5jdXJyZW50VGFyZ2V0LnZhbHVlKVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcGVyUGFnZTogbnVsbFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkZpbHRlckNoYW5nZTogZnVuY3Rpb24gX29uRmlsdGVyQ2hhbmdlKHZhbCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmlsdGVyOiBKU09OLnBhcnNlKHZhbCkgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmlsdGVyOiBudWxsIH0pO1xuICAgIH1cbiAgfSxcblxuICBfb25Tb3J0Q2hhbmdlOiBmdW5jdGlvbiBfb25Tb3J0Q2hhbmdlKHZhbCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc29ydDogSlNPTi5wYXJzZSh2YWwpIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNvcnQ6IG51bGwgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9pc1F1ZXJ5VmFsaWQ6IGZ1bmN0aW9uIF9pc1F1ZXJ5VmFsaWQoKSB7XG4gICAgcmV0dXJuIG51bGwgIT09IHRoaXMuc3RhdGUuZmlsdGVyICYmIG51bGwgIT09IHRoaXMuc3RhdGUuc29ydCAmJiBudWxsICE9PSB0aGlzLnN0YXRlLnBlclBhZ2U7XG4gIH0sXG5cbiAgX2J1aWxkVGFibGVGaWx0ZXI6IGZ1bmN0aW9uIF9idWlsZFRhYmxlRmlsdGVyKCkge1xuICAgIHZhciBpc1F1ZXJ5VmFsaWQgPSB0aGlzLl9pc1F1ZXJ5VmFsaWQoKTtcblxuICAgIHZhciBjYW5SZWZyZXNoUmVzdWx0cyA9IHRoaXMuc3RhdGUuZmlsdGVyICYmIHRoaXMuc3RhdGUucGVyUGFnZSAmJiB0aGlzLnN0YXRlLnNvcnQ7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJyb3dcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sIHMxMiBtN1wiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJ1bFwiLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIm1vZGVsLWZpbHRlcnMgY29sbGFwc2libGVcIiwgcmVmOiBcInF1ZXJ5U2V0dGluZ3NcIiB9LFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sbGFwc2libGUtaGVhZGVyXCIgfSxcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwgeyBjbGFzc05hbWU6IFwiZmEgZmEtZ2VhclwiIH0pLFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgXCJRdWVyeSBzZXR0aW5nc1wiXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJjb2xsYXBzaWJsZS1ib2R5XCIgfSxcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImZvcm1cIixcbiAgICAgICAgICAgICAgICB7IG9uU3VibWl0OiB0aGlzLl9zdWJtaXRTZXR0aW5nc0Zvcm0gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImZpbHRlclwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFwiRmlsdGVyOlwiXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuX29uRmlsdGVyQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwcHhcIixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMjAwcHhcIiB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIlNvcnQ6XCJcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEpzb25FZGl0b3IsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHt9LFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5fb25Tb3J0Q2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwcHhcIixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMjAwcHhcIiB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIlBlciBwYWdlOlwiXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBcIjEwXCIsIG9uQ2hhbmdlOiB0aGlzLl9vbkxpbWl0Q2hhbmdlIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImFjdGlvblwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFN1Ym1pdEJ1dHRvbiwgeyBsYWJlbDogXCJBcHBseVwiLCBkaXNhYmxlZDogIWNhblJlZnJlc2hSZXN1bHRzIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBfYnVpbGRUYWJsZTogZnVuY3Rpb24gX2J1aWxkVGFibGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLnN0YXRlLmNvbHVtbnMsXG4gICAgICAgIHJvd3MgPSB0aGlzLnN0YXRlLnJvd3MgfHwgW107XG5cbiAgICB2YXIgaGVhZGVyID0gY29sdW1ucy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcInRoXCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGMubmFtZVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHZhciBib2R5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICBib2R5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJ0clwiLFxuICAgICAgICBudWxsLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGRcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCBudWxsKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBib2R5ID0gcm93cy5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgdmFsdWVzID0gY29sdW1ucy5tYXAoZnVuY3Rpb24gKGNvbCkge1xuXG4gICAgICAgICAgdmFyIHZhbHVlID0gcm93W2NvbC5uYW1lXSxcbiAgICAgICAgICAgICAgZmxpcFZhbHVlID0gbnVsbDtcblxuICAgICAgICAgIC8vIGlmIHZhbHVlIGlzIGEgZGF0ZVxuICAgICAgICAgIGlmIChcIkRhdGVcIiA9PT0gY29sLnR5cGUpIHtcbiAgICAgICAgICAgIGZsaXBWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSkudG9TdHJpbmcoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBpZiB2YWx1ZSBpcyBhbiBhcnJheVxuICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAvLyBleHRyYWN0IHN1YiBrZXlcbiAgICAgICAgICAgIGlmIChjb2wuc3ViS2V5KSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gXy5wbHVjayh2YWx1ZSwgY29sLnN1YktleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnN0cnVjdCBsaXN0XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHYgfSxcbiAgICAgICAgICAgICAgICB2XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICBcInVsXCIsXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdHJpbmdpZnkgb2JqZWN0c1xuICAgICAgICAgIGVsc2UgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICB7IGtleTogY29sLm5hbWUsIGRhdGFGbGlwVmFsdWU6IGZsaXBWYWx1ZSB9LFxuICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgeyBpZDogcm93Ll9pZCwga2V5OiByb3cuX2lkLCBvbkNsaWNrOiBzZWxmLl9vblJvd0NsaWNrIH0sXG4gICAgICAgICAgdmFsdWVzXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdGFibGVGaWx0ZXIgPSB0aGlzLl9idWlsZFRhYmxlRmlsdGVyKCk7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICBudWxsLFxuICAgICAgdGFibGVGaWx0ZXIsXG4gICAgICBSZW5kZXJVdGlscy5idWlsZEVycm9yKHRoaXMuc3RhdGUuZXJyb3IpLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChQYWdpbmF0aW9uLCB7XG4gICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLnN0YXRlLnBhZ2UsXG4gICAgICAgIHJlc3VsdHNQZXJQYWdlOiB0aGlzLnN0YXRlLnBlclBhZ2UsXG4gICAgICAgIHRvdGFsUmVzdWx0czogdGhpcy5zdGF0ZS50b3RhbFJvd3MsXG4gICAgICAgIG9uU2VsZWN0UGFnZTogdGhpcy5fb25TZWxlY3RQYWdlIH0pLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJob3ZlcmFibGUgYm9yZGVyZWRcIiB9LFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGhlYWRcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgaGVhZGVyXG4gICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGJvZHlcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuY29sdW1ucykge1xuICAgICAgcmVzdWx0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgdGV4dDogXCJMb2FkaW5nIHN0cnVjdHVyZVwiIH0pLFxuICAgICAgICBSZW5kZXJVdGlscy5idWlsZEVycm9yKHRoaXMuc3RhdGUuZXJyb3IpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9idWlsZFRhYmxlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBjbGFzc05hbWU6IFwicGFnZS1tb2RlbFwiIH0sXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEJ1dHRvbiwgeyBpY29uOiBcInBsdXMtY2lyY2xlXCIsIGxhYmVsOiBcIkFkZFwiLCBjbGFzc05hbWU6IFwiYWRkLWJ1dHRvblwiLCBvbkNsaWNrOiB0aGlzLl9vbkFkZENsaWNrIH0pLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJoMlwiLFxuICAgICAgICBudWxsLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIExpbmssXG4gICAgICAgICAgeyB0bzogXCJtb2RlbHNcIiB9LFxuICAgICAgICAgIFwiQ29sbGVjdGlvblwiXG4gICAgICAgICksXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBcIiAvIFwiLFxuICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWxOYW1lXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICByZXN1bHRcbiAgICApO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5xdWVyeVNldHRpbmdzSW5pdGlhbGlzZWQpIHtcbiAgICAgICQoUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnF1ZXJ5U2V0dGluZ3MpKS5jb2xsYXBzaWJsZSgpO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcXVlcnlTZXR0aW5nc0luaXRpYWxpc2VkOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIGZldGNoIGNvbHVtbiBpbmZvXG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogXCIvYWRtaW4vbW9kZWxzL21vZGVsL2NvbHVtbnNcIixcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZm9ybWF0OiBcImpzb25cIixcbiAgICAgICAgbmFtZTogdGhpcy5zdGF0ZS5tb2RlbE5hbWUgfVxuICAgIH0pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnNcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLl9mZXRjaFJvd3MoKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBlcnJvcjogeGhyXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICA7XG4gIH0sXG5cbiAgX3N1Ym1pdFNldHRpbmdzRm9ybTogZnVuY3Rpb24gX3N1Ym1pdFNldHRpbmdzRm9ybShlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gcmVzZXQgcGFnZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcGFnZTogMVxuICAgIH0pO1xuXG4gICAgdGhpcy5fZmV0Y2hSb3dzKCk7XG4gIH0sXG5cbiAgX29uU2VsZWN0UGFnZTogZnVuY3Rpb24gX29uU2VsZWN0UGFnZShuZXdQYWdlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwYWdlOiBuZXdQYWdlXG4gICAgfSk7XG5cbiAgICB0aGlzLl9mZXRjaFJvd3MoKTtcbiAgfSxcblxuICBfZmV0Y2hSb3dzOiBmdW5jdGlvbiBfZmV0Y2hSb3dzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIGdpdmUgdGltZSBmb3IgdmFsdWVzIHRvIHByb3BhZ2F0ZVxuICAgIGlmIChzZWxmLl9mZXRjaFJvd3NUaW1lcikge1xuICAgICAgc2VsZi5fZmV0Y2hSb3dzVGltZXIuc3RvcCgpO1xuICAgIH1cblxuICAgIHNlbGYuX2ZldGNoUm93c1RpbWVyID0gVGltZXIoZnVuY3Rpb24gKCkge1xuXG4gICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgZXJyb3I6IG51bGwgfSk7XG5cbiAgICAgIHZhciBjb2x1bW5OYW1lcyA9IF8ucGx1Y2soc2VsZi5zdGF0ZS5jb2x1bW5zLCBcIm5hbWVcIik7XG5cbiAgICAgIC8vIGZldGNoIGNvbGxlY3Rpb24gcm93c1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvcm93cz9mb3JtYXQ9anNvblwiLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbmFtZTogc2VsZi5zdGF0ZS5tb2RlbE5hbWUsXG4gICAgICAgICAgZmlsdGVyOiBKU09OLnN0cmluZ2lmeShzZWxmLnN0YXRlLmZpbHRlciksXG4gICAgICAgICAgc29ydDogSlNPTi5zdHJpbmdpZnkoc2VsZi5zdGF0ZS5zb3J0KSxcbiAgICAgICAgICBwZXJQYWdlOiBzZWxmLnN0YXRlLnBlclBhZ2UsXG4gICAgICAgICAgcGFnZTogc2VsZi5zdGF0ZS5wYWdlIH1cbiAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgICAgdG90YWxSb3dzOiBkYXRhLmNvdW50LFxuICAgICAgICAgIHJvd3M6IGRhdGEucm93cyB9KTtcbiAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgICBlcnJvcjogeGhyXG4gICAgICAgIH0pO1xuICAgICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgICAgbG9hZGluZzogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCAyMDApLnN0YXJ0KCk7XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL21vZGVsLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY29yZSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanNcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKTtcbnZhciBMaW5rID0gUm91dGVyLkxpbms7XG5cbnZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9sb2FkZXJcIiksXG4gICAgQnV0dG9uID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvYnV0dG9uXCIpLFxuICAgIEpzb25FZGl0b3IgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9qc29uRWRpdG9yXCIpLFxuICAgIE1vZGFsID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvbW9kYWxcIiksXG4gICAgUmVuZGVyVXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvcmVuZGVyVXRpbHNcIiksXG4gICAgR3VhcmRlZFN0YXRlTWl4aW4gPSByZXF1aXJlKFwiLi4vLi4vbWl4aW5zL2d1YXJkZWRTdGF0ZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiBcImV4cG9ydHNcIixcblxuICBjb250ZXh0VHlwZXM6IHtcbiAgICByb3V0ZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gIH0sXG5cbiAgbWl4aW5zOiBbR3VhcmRlZFN0YXRlTWl4aW5dLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHZhciBwYXJhbXMgPSB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKTtcblxuICAgIHJldHVybiB7XG4gICAgICBtb2RlbE5hbWU6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbXMua2V5KSxcbiAgICAgIGlkOiBkZWNvZGVVUklDb21wb25lbnQocGFyYW1zLmlkKSxcbiAgICAgIGVycm9yOiBudWxsIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIGVkaXRpbmdGb3JtID0gdGhpcy5fYnVpbGRFZGl0aW5nRm9ybSgpO1xuXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBjbGFzc05hbWU6IFwicGFnZS1tb2RlbFJvd1wiIH0sXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImgyXCIsXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcInRpdGxlXCIgfSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBMaW5rLFxuICAgICAgICAgIHsgdG86IFwibW9kZWxcIiwgcGFyYW1zOiB7IGtleTogdGhpcy5zdGF0ZS5tb2RlbE5hbWUgfSB9LFxuICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWxOYW1lXG4gICAgICAgICksXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBcIiAvIFwiLFxuICAgICAgICAgIHRoaXMuc3RhdGUuaWRcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIFJlbmRlclV0aWxzLmJ1aWxkRXJyb3IodGhpcy5zdGF0ZS5lcnJvciksXG4gICAgICBlZGl0aW5nRm9ybVxuICAgICk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuX2xvYWQoKTtcbiAgfSxcblxuICBfYnVpbGRFZGl0aW5nRm9ybTogZnVuY3Rpb24gX2J1aWxkRWRpdGluZ0Zvcm0oKSB7XG4gICAgdmFyIGpzb24gPSB0aGlzLnN0YXRlLmpzb247XG5cbiAgICBpZiAodW5kZWZpbmVkID09PSBqc29uKSB7XG4gICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgdGV4dDogXCJMb2FkaW5nIGRhdGFcIiB9KTtcbiAgICB9XG5cbiAgICB2YXIgZGVsZXRlQnV0dG9uID0gbnVsbCxcbiAgICAgICAgc2F2ZUJ0bkxhYmVsID0gXCJDcmVhdGVcIjtcblxuICAgIGlmIChcIm5ld1wiICE9PSB0aGlzLnN0YXRlLmlkKSB7XG4gICAgICBzYXZlQnRuTGFiZWwgPSBcIlVwZGF0ZVwiO1xuXG4gICAgICBkZWxldGVCdXR0b24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KEJ1dHRvbiwgeyBsYWJlbDogXCJEZWxldGVcIiwgY29sb3I6IFwicmVkXCIsIG9uQ2xpY2s6IHRoaXMuX3Nob3dEZWxldGVNb2RhbCB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICBudWxsLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLl9vbkRhdGFDaGFuZ2UsXG4gICAgICAgIHZhbHVlOiBqc29uLFxuICAgICAgICBoZWlnaHQ6IFwiNDAwcHhcIixcbiAgICAgICAgcmVmOiBcImVkaXRvclwiIH0pLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiYWN0aW9uc1wiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQnV0dG9uLCB7IGxhYmVsOiBzYXZlQnRuTGFiZWwsIGRpc2FibGVkOiAhanNvbiwgb25DbGljazogdGhpcy5fc2F2ZSB9KSxcbiAgICAgICAgZGVsZXRlQnV0dG9uXG4gICAgICApLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgTW9kYWwsXG4gICAgICAgIHtcbiAgICAgICAgICByZWY6IFwiZGVsZXRlTW9kYWxcIixcbiAgICAgICAgICBpZDogXCJkZWxldGVEb2NNb2RhbFwiLFxuICAgICAgICAgIGFjdGlvbnM6IFtcIlllc1wiLCBcIk5vXCJdLFxuICAgICAgICAgIG9uQWN0aW9uOiB0aGlzLl9vbkRlbGV0ZU1vZGFsQWN0aW9uIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgdGhpcyBkb2N1bWVudCBmcm9tIHRoZSBjb2xsZWN0aW9uP1wiXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIF9vbkRhdGFDaGFuZ2U6IGZ1bmN0aW9uIF9vbkRhdGFDaGFuZ2UoZGF0YSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIganNvbiA9IEpTT04ucGFyc2UoZGF0YSk7XG5cbiAgICAgIC8vIG11c3Qgbm90IGJlIGVtcHR5IG9iamVjdFxuICAgICAgaWYgKCFqc29uIHx8ICFfY29yZS5PYmplY3Qua2V5cyhqc29uKS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBqc29uOiBkYXRhXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBqc29uOiBudWxsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX2xvYWQ6IGZ1bmN0aW9uIF9sb2FkKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIGlmIGNyZWF0aW5nIGEgbmV3IGl0ZW0gdGhlbiBubyBuZWVkIHRvIGZldGNoIGRhdGEgdG8gc3RhcnQgd2l0aFxuICAgIGlmIChcIm5ld1wiID09PSB0aGlzLnN0YXRlLmlkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGpzb246IHt9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvZG9jXCIsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZvcm1hdDogXCJqc29uXCIsXG4gICAgICAgIG5hbWU6IHRoaXMuc3RhdGUubW9kZWxOYW1lLFxuICAgICAgICBpZDogdGhpcy5zdGF0ZS5pZCB9XG4gICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgdmFyIGRvYyA9IEpTT04ucGFyc2UoZGF0YS5kb2MpO1xuXG4gICAgICAvLyByZW1vdmUgaWQgYXR0cmlidXRlXG4gICAgICBkZWxldGUgZG9jLl9pZDtcblxuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGpzb246IGRvY1xuICAgICAgfSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgZXJyb3I6IHhoclxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgO1xuICB9LFxuXG4gIF91cGRhdGU6IGZ1bmN0aW9uIF91cGRhdGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzdWJtaXR0aW5nOiB0cnVlLFxuICAgICAgZXJyb3I6IG51bGxcbiAgICB9KTtcblxuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiUFVUXCIsXG4gICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9kb2M/Zm9ybWF0PWpzb24mbmFtZT1cIiArIHRoaXMuc3RhdGUubW9kZWxOYW1lICsgXCImaWQ9XCIgKyB0aGlzLnN0YXRlLmlkLFxuICAgICAgZGF0YToge1xuICAgICAgICBkb2M6IHRoaXMuc3RhdGUuanNvblxuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgTWF0ZXJpYWxpemUudG9hc3QoXCJVcGRhdGUgc3VjY2Vzc2Z1bFwiLCAyMDAwLCBcInJvdW5kZWRcIik7XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgZXJyb3I6IHhoclxuICAgICAgfSk7XG4gICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBzdWJtaXR0aW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX2NyZWF0ZTogZnVuY3Rpb24gX2NyZWF0ZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHN1Ym1pdHRpbmc6IHRydWUsXG4gICAgICBlcnJvcjogbnVsbFxuICAgIH0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9kb2M/Zm9ybWF0PWpzb24mbmFtZT1cIiArIHRoaXMuc3RhdGUubW9kZWxOYW1lLFxuICAgICAgZGF0YToge1xuICAgICAgICBkb2M6IHRoaXMuc3RhdGUuanNvblxuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIE1hdGVyaWFsaXplLnRvYXN0KFwiQ3JlYXRlIHN1Y2Nlc3NmdWxcIiwgMjAwMCwgXCJyb3VuZGVkXCIpO1xuXG4gICAgICB2YXIgZG9jID0gSlNPTi5wYXJzZShkYXRhLmRvYyksXG4gICAgICAgICAgaWQgPSBkb2MuX2lkO1xuXG4gICAgICBkZWxldGUgZG9jLl9pZDtcblxuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGlkOiBpZCxcbiAgICAgICAganNvbjogZG9jIH0pO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgc3VibWl0dGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIF9zYXZlOiBmdW5jdGlvbiBfc2F2ZSgpIHtcbiAgICBpZiAoXCJuZXdcIiA9PT0gdGhpcy5zdGF0ZS5pZCkge1xuICAgICAgdGhpcy5fY3JlYXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgIH1cbiAgfSxcblxuICBfZGVsZXRlOiBmdW5jdGlvbiBfZGVsZXRlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc3VibWl0dGluZzogdHJ1ZSxcbiAgICAgIGVycm9yOiBudWxsIH0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcbiAgICAgIHVybDogXCIvYWRtaW4vbW9kZWxzL21vZGVsL2RvYz9mb3JtYXQ9anNvbiZuYW1lPVwiICsgdGhpcy5zdGF0ZS5tb2RlbE5hbWUgKyBcIiZpZD1cIiArIHRoaXMuc3RhdGUuaWQgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICBNYXRlcmlhbGl6ZS50b2FzdChcIkRlbGV0ZSBzdWNjZXNzZnVsXCIsIDIwMDAsIFwicm91bmRlZFwiKTtcblxuICAgICAgc2VsZi5jb250ZXh0LnJvdXRlci50cmFuc2l0aW9uVG8oXCJtb2RlbFwiLCB7XG4gICAgICAgIGtleTogc2VsZi5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkua2V5IH0pO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgc3VibWl0dGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIF9zaG93RGVsZXRlTW9kYWw6IGZ1bmN0aW9uIF9zaG93RGVsZXRlTW9kYWwoKSB7XG4gICAgdGhpcy5yZWZzLmRlbGV0ZU1vZGFsLm9wZW4oKTtcbiAgfSxcblxuICBfb25EZWxldGVNb2RhbEFjdGlvbjogZnVuY3Rpb24gX29uRGVsZXRlTW9kYWxBY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKFwieWVzXCIgPT09IGFjdGlvbi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICB0aGlzLl9kZWxldGUoKTtcbiAgICB9XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL3Jvdy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImFkbWluLm1vZGVscy5qcyJ9